from google import genai
from dotenv import load_dotenv
import os

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key)

if api_key:
    print(f"Key loaded! Starts with: {api_key[:8]}...")
else:
    print("❌ ERROR: Key is empty. Check your .env file naming.")

try:
    response = client.models.generate_content(
        model="gemini-2.0-flash", # <--- Changed from gemini-1.5-flash
        contents="Say 'The vault is open!'"
    )
    print(response.text)
except Exception as e:
    print(f"Connection Failed: {e}")