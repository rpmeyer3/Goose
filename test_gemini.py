from google import genai
import os
from dotenv import load_dotenv

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

try:
    # Use gemini-2.5-flash or the preview of gemini-3-flash
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents="Say 'The vault is open!'"
    )
    print(f"Success: {response.text}")
except Exception as e:
    print(f"Connection Failed: {e}")