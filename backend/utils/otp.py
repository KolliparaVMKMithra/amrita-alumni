"""OTP generation, storage, verification, and rate limiting.
Uses Redis when available, falls back to in-memory dict for local dev.
"""

import os
import secrets
import time
import json
from dotenv import load_dotenv

load_dotenv()

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# Constants
OTP_TTL = 300          # 5 minutes
OTP_LOCK_TTL = 900     # 15 minutes
MAX_OTP_ATTEMPTS = 3
MAX_OTP_REQUESTS_PER_HOUR = 5
RESEND_COOLDOWN = 60   # seconds

# ---------------------------------------------------------------------------
# In-memory fallback store (used when Redis is unavailable)
# Format: { key: (value, expires_at_unix_timestamp) }
# ---------------------------------------------------------------------------
_mem: dict[str, tuple[str, float]] = {}


def _mem_set(key: str, value: str, ttl: int) -> None:
    _mem[key] = (value, time.time() + ttl)


def _mem_get(key: str) -> str | None:
    if key not in _mem:
        return None
    val, exp = _mem[key]
    if time.time() > exp:
        del _mem[key]
        return None
    return val


def _mem_exists(key: str) -> bool:
    return _mem_get(key) is not None


def _mem_delete(key: str) -> None:
    _mem.pop(key, None)


def _mem_ttl(key: str) -> int:
    if key not in _mem:
        return -2
    _, exp = _mem[key]
    remaining = exp - time.time()
    return max(0, int(remaining))


def _mem_incr(key: str) -> str:
    val = _mem_get(key)
    new_val = str(int(val) + 1) if val else "1"
    _, exp = _mem.get(key, (None, time.time() + 3600))
    _mem[key] = (new_val, exp)
    return new_val


# ---------------------------------------------------------------------------
# Redis client (lazy init — only connect if Redis is reachable)
# ---------------------------------------------------------------------------
_redis_client = None
_redis_available = None  # None = not yet tested


async def _get_redis():
    """Return Redis client if available, else None (use in-memory)."""
    global _redis_client, _redis_available

    if _redis_available is False:
        return None
    if _redis_available is True and _redis_client is not None:
        return _redis_client

    try:
        import redis.asyncio as redis
        client = redis.from_url(REDIS_URL, decode_responses=True, socket_connect_timeout=2)
        await client.ping()
        _redis_client = client
        _redis_available = True
        print("[REDIS] Connected to Redis successfully.")
        return _redis_client
    except Exception as e:
        _redis_available = False
        print(f"[REDIS] Not available ({type(e).__name__}). Using in-memory store for OTP.")
        return None


# ---------------------------------------------------------------------------
# Unified storage helpers (Redis if up, else in-memory)
# ---------------------------------------------------------------------------

async def _exists(key: str) -> bool:
    r = await _get_redis()
    if r:
        return bool(await r.exists(key))
    return _mem_exists(key)


async def _get(key: str) -> str | None:
    r = await _get_redis()
    if r:
        return await r.get(key)
    return _mem_get(key)


async def _setex(key: str, ttl: int, value: str) -> None:
    r = await _get_redis()
    if r:
        await r.setex(key, ttl, value)
    else:
        _mem_set(key, value, ttl)


async def _delete(*keys: str) -> None:
    r = await _get_redis()
    if r:
        await r.delete(*keys)
    else:
        for k in keys:
            _mem_delete(k)


async def _ttl(key: str) -> int:
    r = await _get_redis()
    if r:
        return await r.ttl(key)
    return _mem_ttl(key)


async def _incr(key: str) -> str:
    r = await _get_redis()
    if r:
        result = await r.incr(key)
        return str(result)
    return _mem_incr(key)


# ---------------------------------------------------------------------------
# Public OTP API
# ---------------------------------------------------------------------------

def generate_otp() -> str:
    """Generate a cryptographically secure 6-digit OTP."""
    return f"{secrets.randbelow(1000000):06d}"


async def store_otp(email: str, otp: str) -> bool:
    """Store OTP with TTL. Returns False if rate limited."""
    email_lower = email.lower().strip()

    # Check lock
    if await _exists(f"otp_lock:{email_lower}"):
        return False

    # Check hourly rate limit
    rate_count = await _get(f"otp_rate:{email_lower}")
    if rate_count and int(rate_count) >= MAX_OTP_REQUESTS_PER_HOUR:
        return False

    # Store OTP
    await _setex(f"otp:{email_lower}", OTP_TTL, otp)
    await _delete(f"otp_attempts:{email_lower}")

    # Increment rate counter
    if not await _exists(f"otp_rate:{email_lower}"):
        await _setex(f"otp_rate:{email_lower}", 3600, "1")
    else:
        await _incr(f"otp_rate:{email_lower}")

    # Resend cooldown
    await _setex(f"otp_cooldown:{email_lower}", RESEND_COOLDOWN, "1")

    return True


async def verify_otp(email: str, otp: str) -> tuple[bool, str]:
    """Verify OTP. Returns (success, message)."""
    email_lower = email.lower().strip()

    # Check lock
    if await _exists(f"otp_lock:{email_lower}"):
        ttl = await _ttl(f"otp_lock:{email_lower}")
        minutes = max(1, ttl // 60)
        return False, f"Too many failed attempts. Try again in {minutes} minutes."

    stored_otp = await _get(f"otp:{email_lower}")
    if not stored_otp:
        return False, "OTP has expired. Please request a new one."

    attempts_val = await _get(f"otp_attempts:{email_lower}")
    current_attempts = int(attempts_val) if attempts_val else 0

    if stored_otp != otp:
        current_attempts += 1
        await _setex(f"otp_attempts:{email_lower}", OTP_TTL, str(current_attempts))
        if current_attempts >= MAX_OTP_ATTEMPTS:
            await _setex(f"otp_lock:{email_lower}", OTP_LOCK_TTL, "1")
            await _delete(f"otp:{email_lower}", f"otp_attempts:{email_lower}")
            return False, "Too many failed attempts. Email locked for 15 minutes."
        remaining = MAX_OTP_ATTEMPTS - current_attempts
        return False, f"Incorrect code. {remaining} attempt(s) remaining."

    # Correct — delete single-use OTP
    await _delete(f"otp:{email_lower}", f"otp_attempts:{email_lower}")
    return True, "OTP verified successfully."


async def can_resend_otp(email: str) -> tuple[bool, int]:
    """Check if OTP can be resent. Returns (can_resend, seconds_remaining)."""
    email_lower = email.lower().strip()

    if await _exists(f"otp_lock:{email_lower}"):
        return False, await _ttl(f"otp_lock:{email_lower}")

    if await _exists(f"otp_cooldown:{email_lower}"):
        return False, await _ttl(f"otp_cooldown:{email_lower}")

    rate_count = await _get(f"otp_rate:{email_lower}")
    if rate_count and int(rate_count) >= MAX_OTP_REQUESTS_PER_HOUR:
        return False, await _ttl(f"otp_rate:{email_lower}")

    return True, 0


async def store_temp_user_data(email: str, data: dict) -> None:
    """Store temporary user data during OTP flow."""
    email_lower = email.lower().strip()
    await _setex(f"temp_user:{email_lower}", OTP_TTL + 60, json.dumps(data))


async def get_temp_user_data(email: str) -> dict | None:
    """Retrieve temporary user data."""
    email_lower = email.lower().strip()
    raw = await _get(f"temp_user:{email_lower}")
    return json.loads(raw) if raw else None


async def delete_temp_user_data(email: str) -> None:
    """Delete temporary user data."""
    email_lower = email.lower().strip()
    await _delete(f"temp_user:{email_lower}")
