# Amrita University Alumni Portal

A full-stack, production-grade Alumni Portal built with **Next.js 14**, **FastAPI**, **PostgreSQL**, **Firebase Auth**, and **Redis**.

## 🏗️ Project Structure

```
amrita-alumni/
├── frontend/          # Next.js 14 App Router
├── backend/           # FastAPI Python backend
├── scripts/           # Utility scripts
└── docker-compose.yml # Local dev setup
```

---

## 🚀 Local Setup

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL 15
- Redis 7
- Firebase project

---

### 1. Clone & Configure

```bash
cd amrita-alumni
```

---

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate   # Windows
# source venv/bin/activate  # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Copy env template
copy .env.example .env
# Fill in all values in .env
```

**Generate admin password hash:**
```bash
python ..\scripts\generate_admin_hash.py yourAdminPassword
# Copy the hash to ADMIN_PASSWORD_HASH in .env
```

**Run backend (from the repository root directory):**
```bash
# Navigate to the repository root
cd ..

# Run using the backend virtual environment
.\backend\venv\Scripts\uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

*Alternatively, to run it from inside the `backend` directory:*
On Windows (PowerShell):
```powershell
$env:PYTHONPATH=".."
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```
On macOS/Linux:
```bash
PYTHONPATH=.. uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

API docs: http://localhost:8000/docs

---

### 3. Frontend Setup

```bash
cd frontend

# Copy env template
copy .env.local.example .env.local
# Fill in Firebase config values from your Firebase project

# Install dependencies
npm install

# Run frontend
npm run dev
```

Frontend: http://localhost:3000

---

### 4. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable **Authentication** → Email/Password + Google providers
4. Enable **Firestore Database** (for notifications)
5. Enable **Storage**
6. Go to Project Settings → Service Accounts → Generate new private key
7. Paste the JSON content into `FIREBASE_SERVICE_ACCOUNT_JSON` in backend `.env`
8. Copy client config to frontend `.env.local`

---

### 5. Gmail SMTP Setup (for OTP emails)

1. Enable 2FA on your Gmail account
2. Go to Google Account → Security → App Passwords
3. Generate an App Password for "Mail"
4. Set `SMTP_USER=your-gmail@gmail.com` and `SMTP_PASSWORD=<app-password>` in `.env`

---

### 6. Docker Compose (Recommended)

```bash
# From project root
docker-compose up --build
```

Services:
- PostgreSQL: localhost:5432
- Redis: localhost:6379
- Backend: localhost:8000
- Frontend: localhost:3000

---

## 🔐 Security Features

- Firebase ID token verification on every API call
- Email OTP: 6-digit, 5-minute TTL, 3-attempt lockout, 5/hour rate limit
- Admin: bcrypt password + httpOnly JWT cookie (8hr expiry)
- CORS locked to configured origin
- Rate limiting: 100 req/min per IP
- Security headers: X-Frame-Options, X-Content-Type-Options, etc.
- File upload validation: MIME type + size checks
- All user data ownership enforced (user_id check)

---

## 📋 Environment Variables

### Backend (`backend/.env`)
| Variable | Description |
|---|---|
| DATABASE_URL | PostgreSQL async connection string |
| REDIS_URL | Redis connection string |
| FIREBASE_SERVICE_ACCOUNT_JSON | Firebase Admin SDK service account JSON |
| FIREBASE_STORAGE_BUCKET | Firebase Storage bucket name |
| ADMIN_USERNAME | Admin panel username |
| ADMIN_PASSWORD_HASH | bcrypt hash of admin password |
| ADMIN_JWT_SECRET | 64-char random secret for admin JWT |
| CORS_ORIGIN | Allowed frontend origin |
| SMTP_HOST | SMTP server (smtp.gmail.com) |
| SMTP_PORT | SMTP port (587) |
| SMTP_USER | Gmail address |
| SMTP_PASSWORD | Gmail App Password |

### Frontend (`frontend/.env.local`)
| Variable | Description |
|---|---|
| NEXT_PUBLIC_FIREBASE_* | Firebase client SDK config |
| NEXT_PUBLIC_API_BASE_URL | Backend API URL |

---

## 🎓 Features

- **Landing page** with alumni stats, about, and CTA
- **Email OTP authentication** (no SMS, fully free)
- **Google OAuth** sign-in
- **9-step alumni registration** with auto-save
- **Alumni profile** with tabbed layout (Overview, Career, Education, Engagement, Social)
- **Admin panel** with search, 15+ filters, sortable table, CSV export, detail modal
- **Firebase Storage** for photos and resumes
- **Confetti animation** on registration completion
- **Responsive design** - works on mobile and desktop

---

## 📄 License
MIT
