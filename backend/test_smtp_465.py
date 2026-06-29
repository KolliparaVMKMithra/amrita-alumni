import os
import asyncio
import aiosmtplib
from email.mime.text import MIMEText
from dotenv import load_dotenv

load_dotenv()

async def test_email():
    smtp_host = "smtp.gmail.com"
    smtp_port = 465
    smtp_user = os.getenv("SMTP_USER", "")
    smtp_password = os.getenv("SMTP_PASSWORD", "")
    
    print("Testing connection to Gmail on Port 465 (SSL/TLS)...")
    print(f"User: {smtp_user}")
    
    msg = MIMEText("This is a test email on port 465.", "plain")
    msg["Subject"] = "SMTP Diagnostic Test (Port 465)"
    msg["From"] = smtp_user
    msg["To"] = "vmkmithra30@gmail.com"
    
    try:
        await aiosmtplib.send(
            msg,
            hostname=smtp_host,
            port=smtp_port,
            username=smtp_user,
            password=smtp_password,
            use_tls=True,
        )
        print("SUCCESS! SMTP connection and delivery on Port 465 completed successfully!")
    except Exception as e:
        print("ERROR occurred during SMTP Port 465 delivery:")
        print(f"Exception type: {type(e).__name__}")
        print(f"Error details: {e}")

if __name__ == "__main__":
    asyncio.run(test_email())
