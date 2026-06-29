import os
import asyncio
import aiosmtplib
from email.mime.text import MIMEText
from dotenv import load_dotenv

load_dotenv()

async def test_email():
    smtp_host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.getenv("SMTP_PORT", "587"))
    smtp_user = os.getenv("SMTP_USER", "")
    smtp_password = os.getenv("SMTP_PASSWORD", "")
    
    print("Testing connection to SMTP server...")
    print(f"Host: {smtp_host}, Port: {smtp_port}")
    print(f"User: {smtp_user}")
    print(f"Password configured: {'Yes' if smtp_password else 'No'}")
    
    msg = MIMEText("This is a test email from Amrita University Alumni Portal setup.", "plain")
    msg["Subject"] = "SMTP Diagnostic Test"
    msg["From"] = smtp_user
    msg["To"] = "vmkmithra30@gmail.com"
    
    try:
        await aiosmtplib.send(
            msg,
            hostname=smtp_host,
            port=smtp_port,
            username=smtp_user,
            password=smtp_password,
            start_tls=True,
        )
        print("✅ SUCCESS! SMTP connection and delivery completed successfully!")
    except Exception as e:
        print("❌ ERROR occurred during SMTP delivery:")
        print(f"Exception type: {type(e).__name__}")
        print(f"Error details: {e}")

if __name__ == "__main__":
    asyncio.run(test_email())
