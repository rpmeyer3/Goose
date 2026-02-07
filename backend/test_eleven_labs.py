import os
import base64
from dotenv import load_dotenv
from elevenlabs.client import ElevenLabs

# Load the .env file
load_dotenv()

# Fetch the key
api_key = os.getenv("ELEVENLABS_API_KEY")

if not api_key:
    print("❌ ERROR: ELEVENLABS_API_KEY not found in .env file.")
else:
    print(f"Key loaded! Starts with: {api_key[:6]}...")

    # Initialize Client
    client = ElevenLabs(api_key=api_key)

    try:
        print("Attempting to summon the Goblin's voice...")

        # We use a very short text to save your credits
        audio_generator = client.text_to_speech.convert(
            text="The vault is secure, wizard.",
            voice_id="EXAVITQu4vr4xnSDxMaL",  # Sarah voice
            model_id="eleven_turbo_v2_5"
        )

        # Convert the generator output to bytes
        audio_data = b"".join(audio_generator)

        # Success check
        if len(audio_data) > 0:
            print(f"✅ Success! Generated {len(audio_data)} bytes of audio.")

            # Optional: Save it to a file to listen to it
            with open("test_voice.mp3", "wb") as f:
                f.write(audio_data)
            print("Successfully saved to 'test_voice.mp3'.")

    except Exception as e:
        print(f"❌ Connection Failed: {e}")