import bcrypt
import sys

def main():
    if len(sys.argv) != 2:
        print("Usage: python generate_admin_hash.py <password>")
        sys.exit(1)
        
    password = sys.argv[1]
    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    print(f"\nPassword Hash: {hashed.decode('utf-8')}")
    print("\nCopy this hash and paste it as ADMIN_PASSWORD_HASH in your backend/.env file.")

if __name__ == "__main__":
    main()
