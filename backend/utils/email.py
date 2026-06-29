"""Email sender using aiosmtplib for OTP delivery."""

import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import aiosmtplib
from dotenv import load_dotenv

load_dotenv()

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM_NAME = os.getenv("SMTP_FROM_NAME", "Amrita University Alumni Portal")


def build_otp_email_html(otp: str) -> str:
    """Build a clean HTML email template with the OTP code."""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0; padding:0; background-color:#f4f4f7; font-family:'Open Sans', Arial, sans-serif;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f4f7;">
            <tr>
                <td align="center" style="padding:40px 0;">
                    <table role="presentation" width="480" cellspacing="0" cellpadding="0" style="background-color:#ffffff; border-radius:12px; box-shadow:0 4px 24px rgba(0,0,0,0.08); overflow:hidden;">
                        <!-- Header -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #8B1A1A 0%, #6B1414 100%); padding:32px 40px; text-align:center;">
                                <h1 style="margin:0; color:#D4A017; font-family:'Montserrat', Arial, sans-serif; font-size:22px; font-weight:700; letter-spacing:1px;">
                                    AMRITA UNIVERSITY
                                </h1>
                                <p style="margin:4px 0 0; color:#ffffff; font-size:13px; letter-spacing:2px; text-transform:uppercase;">
                                    Alumni Portal
                                </p>
                            </td>
                        </tr>
                        <!-- Body -->
                        <tr>
                            <td style="padding:40px;">
                                <h2 style="margin:0 0 8px; color:#1a1a2e; font-family:'Montserrat', Arial, sans-serif; font-size:20px; font-weight:600;">
                                    Verify Your Email
                                </h2>
                                <p style="margin:0 0 28px; color:#555; font-size:15px; line-height:1.6;">
                                    Use the verification code below to complete your account setup. This code is valid for <strong>5 minutes</strong>.
                                </p>
                                <!-- OTP Code -->
                                <div style="background:#f8f5f0; border:2px dashed #D4A017; border-radius:10px; padding:24px; text-align:center; margin:0 0 28px;">
                                    <p style="margin:0 0 8px; color:#888; font-size:12px; text-transform:uppercase; letter-spacing:2px;">
                                        Your Verification Code
                                    </p>
                                    <p style="margin:0; color:#8B1A1A; font-family:'Courier New', monospace; font-size:40px; font-weight:700; letter-spacing:12px;">
                                        {otp}
                                    </p>
                                </div>
                                <p style="margin:0 0 8px; color:#888; font-size:13px; line-height:1.5;">
                                    ⚠️ Do not share this code with anyone. Our team will never ask for your verification code.
                                </p>
                                <p style="margin:0; color:#888; font-size:13px; line-height:1.5;">
                                    If you did not request this code, you can safely ignore this email.
                                </p>
                            </td>
                        </tr>
                        <!-- Footer -->
                        <tr>
                            <td style="background:#f8f5f0; padding:20px 40px; text-align:center; border-top:1px solid #eee;">
                                <p style="margin:0; color:#999; font-size:12px;">
                                    Amrita Vishwa Vidyapeetham &bull; Alumni Relations Office
                                </p>
                                <p style="margin:4px 0 0; color:#bbb; font-size:11px;">
                                    This is an automated email. Please do not reply.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """


async def send_otp_email(to_email: str, otp: str) -> bool:
    """Send OTP email. Tries EmailJS first, then Resend, then Gmail SMTP, then Developer console."""
    # Find the backend directory dynamically and force load of backend/.env
    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    env_path = os.path.join(backend_dir, ".env")
    load_dotenv(dotenv_path=env_path, override=True)
    
    # 1. Try EmailJS HTTP API (HTTPS over Port 443 - Bypasses SMTP blocks, sends to anyone for free)
    emailjs_service_id = os.getenv("EMAILJS_SERVICE_ID", "")
    emailjs_template_id = os.getenv("EMAILJS_TEMPLATE_ID", "")
    emailjs_public_key = os.getenv("EMAILJS_PUBLIC_KEY", "")
    emailjs_private_key = os.getenv("EMAILJS_PRIVATE_KEY", "")
    
    use_emailjs = bool(
        emailjs_service_id 
        and emailjs_template_id 
        and emailjs_public_key 
        and not emailjs_template_id.startswith("your-")
    )
    
    if use_emailjs:
        import httpx
        try:
            url = "https://api.emailjs.com/api/v1.0/email/send"
            headers = {"Content-Type": "application/json"}
            data = {
                "service_id": emailjs_service_id,
                "template_id": emailjs_template_id,
                "user_id": emailjs_public_key,
                "template_params": {
                    "to_email": to_email,
                    "otp": otp,
                    "subject": "Your Alumni Portal Verification Code",
                }
            }
            if emailjs_private_key:
                data["accessToken"] = emailjs_private_key
                
            async with httpx.AsyncClient() as client:
                response = await client.post(url, headers=headers, json=data, timeout=10.0)
                
            if response.status_code == 200:
                print(f"✅ Email sent successfully via EmailJS HTTP API to {to_email}!")
                return True
            else:
                print(f"[EMAILJS ERROR] Status {response.status_code}: {response.text}")
        except Exception as e:
            print(f"[EMAILJS EXCEPTION] Failed to send via EmailJS: {e}")

    # 2. Try Resend HTTP API (HTTPS over Port 443 - Sandbox requires self-sending unless domain is verified)
    resend_api_key = os.getenv("RESEND_API_KEY", "")
    use_resend = bool(resend_api_key and not resend_api_key.startswith("your-"))
    
    if use_resend:
        import httpx
        try:
            url = "https://api.resend.com/emails"
            headers = {
                "Authorization": f"Bearer {resend_api_key}",
                "Content-Type": "application/json",
            }
            sender = "Alumni Portal <onboarding@resend.dev>"
            html_content = build_otp_email_html(otp)
            
            data = {
                "from": sender,
                "to": [to_email],
                "subject": "Your Alumni Portal Verification Code",
                "html": html_content,
            }
            
            async with httpx.AsyncClient() as client:
                response = await client.post(url, headers=headers, json=data, timeout=10.0)
                
            if response.status_code in (200, 201):
                print(f"✅ Email sent successfully via Resend HTTP API to {to_email}!")
                return True
            else:
                print(f"[RESEND SMTP BYPASS ERROR] Status {response.status_code}: {response.text}")
        except Exception as e:
            print(f"[RESEND EXCEPTION] Failed to send via Resend: {e}")

    # 3. Fallback to Gmail SMTP (If HTTP APIs are not configured, or fail, and SMTP ports are open)
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER", "")
    smtp_password = os.getenv("SMTP_PASSWORD", "")
    smtp_from_name = os.getenv("SMTP_FROM_NAME", "Amrita University Alumni Portal")

    is_placeholder = (
        not smtp_user 
        or not smtp_password 
        or "your-gmail" in smtp_user 
        or "your-gmail-app-password" in smtp_password
    )

    if is_placeholder:
        print("\n" + "=" * 60)
        print(f"[DEV MODE] OTP for {to_email}: {otp}")
        print("=" * 60 + "\n")
        return True

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Your Alumni Portal Verification Code"
    msg["From"] = f"{smtp_from_name} <{smtp_user}>"
    msg["To"] = to_email

    # Plain text fallback
    text_content = f"""
    Amrita University Alumni Portal

    Your verification code is: {otp}

    This code expires in 5 minutes. Do not share it with anyone.

    If you did not request this, please ignore this email.
    """

    html_content = build_otp_email_html(otp)

    msg.attach(MIMEText(text_content, "plain"))
    msg.attach(MIMEText(html_content, "html"))

    try:
        smtp = aiosmtplib.SMTP(hostname=smtp_host, port=smtp_port, use_tls=False)
        await smtp.connect()
        await smtp.starttls()
        await smtp.login(smtp_user, smtp_password)
        await smtp.send_message(msg)
        await smtp.quit()
        print(f"[EMAIL OK] Sent to {to_email} via Gmail SMTP.")
        return True
    except Exception as e:
        print(f"[EMAIL ERROR] {type(e).__name__}: {e}")
        print("\n" + "=" * 60)
        print(f"[DEV FALLBACK] SMTP failed. OTP for {to_email}: {otp}")
        print("=" * 60 + "\n")
        return True


def build_reset_password_email_html(temp_password: str) -> str:
    """Build a clean HTML email template with the temporary password."""
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0; padding:0; background-color:#f4f4f7; font-family:'Open Sans', Arial, sans-serif;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f4f7;">
            <tr>
                <td align="center" style="padding:40px 0;">
                    <table role="presentation" width="480" cellspacing="0" cellpadding="0" style="background-color:#ffffff; border-radius:12px; box-shadow:0 4px 24px rgba(0,0,0,0.08); overflow:hidden;">
                        <!-- Header -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #8B1A1A 0%, #6B1414 100%); padding:32px 40px; text-align:center;">
                                <h1 style="margin:0; color:#D4A017; font-family:'Montserrat', Arial, sans-serif; font-size:22px; font-weight:700; letter-spacing:1px;">
                                    AMRITA UNIVERSITY
                                </h1>
                                <p style="margin:4px 0 0; color:#ffffff; font-size:13px; letter-spacing:2px; text-transform:uppercase;">
                                    Alumni Portal
                                </p>
                            </td>
                        </tr>
                        <!-- Body -->
                        <tr>
                            <td style="padding:40px;">
                                <h2 style="margin:0 0 8px; color:#1a1a2e; font-family:'Montserrat', Arial, sans-serif; font-size:20px; font-weight:600;">
                                    Password Reset Request
                                </h2>
                                <p style="margin:0 0 28px; color:#555; font-size:15px; line-height:1.6;">
                                    We received a request to reset your password. Use the temporary password below to log in. Once logged in, please update your password in your profile.
                                </p>
                                <!-- Temp Password -->
                                <div style="background:#f8f5f0; border:2px dashed #D4A017; border-radius:10px; padding:24px; text-align:center; margin:0 0 28px;">
                                    <p style="margin:0 0 8px; color:#888; font-size:12px; text-transform:uppercase; letter-spacing:2px;">
                                        Temporary Password
                                    </p>
                                    <p style="margin:0; color:#8B1A1A; font-family: monospace; font-size:24px; font-weight:700; word-break: break-all;">
                                        {temp_password}
                                    </p>
                                </div>
                                <p style="margin:0 0 8px; color:#888; font-size:13px; line-height:1.5;">
                                    ⚠️ Make sure to change your password immediately after logging in.
                                </p>
                                <p style="margin:0; color:#888; font-size:13px; line-height:1.5;">
                                    If you did not request a password reset, please contact alumni support.
                                </p>
                            </td>
                        </tr>
                        <!-- Footer -->
                        <tr>
                            <td style="background:#f8f5f0; padding:20px 40px; text-align:center; border-top:1px solid #eee;">
                                <p style="margin:0; color:#999; font-size:12px;">
                                    Amrita Vishwa Vidyapeetham &bull; Alumni Relations Office
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    """


async def send_reset_password_email(to_email: str, temp_password: str) -> bool:
    """Send temporary password reset email."""
    backend_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    env_path = os.path.join(backend_dir, ".env")
    load_dotenv(dotenv_path=env_path, override=True)

    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER", "")
    smtp_password = os.getenv("SMTP_PASSWORD", "")
    smtp_from_name = os.getenv("SMTP_FROM_NAME", "Amrita University Alumni Portal")

    is_placeholder = (
        not smtp_user 
        or not smtp_password 
        or "your-gmail" in smtp_user 
        or "your-gmail-app-password" in smtp_password
    )

    if is_placeholder:
        print("\n" + "=" * 60)
        print(f"[DEV MODE] Temporary Password for {to_email}: {temp_password}")
        print("=" * 60 + "\n")
        return True

    msg = MIMEMultipart("alternative")
    msg["Subject"] = "Amrita Alumni Portal Password Reset"
    msg["From"] = f"{smtp_from_name} <{smtp_user}>"
    msg["To"] = to_email

    text_content = f"""
    Amrita University Alumni Portal Password Reset

    Your temporary password is: {temp_password}

    Please change this password immediately after logging in.
    """

    html_content = build_reset_password_email_html(temp_password)

    msg.attach(MIMEText(text_content, "plain"))
    msg.attach(MIMEText(html_content, "html"))

    try:
        smtp = aiosmtplib.SMTP(hostname=smtp_host, port=smtp_port, use_tls=False)
        await smtp.connect()
        await smtp.starttls()
        await smtp.login(smtp_user, smtp_password)
        await smtp.send_message(msg)
        await smtp.quit()
        print(f"[EMAIL OK] Sent password reset to {to_email} via Gmail SMTP.")
        return True
    except Exception as e:
        print(f"[EMAIL ERROR] {type(e).__name__}: {e}")
        print("\n" + "=" * 60)
        print(f"[DEV FALLBACK] SMTP failed. Temporary Password for {to_email}: {temp_password}")
        print("=" * 60 + "\n")
        return True

