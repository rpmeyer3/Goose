from google import genai
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# The client gets the API key from the environment variable `GEMINI_API_KEY`
client = genai.Client()

response = client.models.generate_content(
    model="gemini-2.5-flash",  # Using an available model
    contents="Explain why Ronaldo is better than Messi in a few words."
)
print(response.text)

