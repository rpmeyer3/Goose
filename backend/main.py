import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # insert React frontend address
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

class Message(BaseModel):
    text: str

@app.post("/api/message")
async def receive_message(message: Message):
    return {
        "reply": f"Backend received: {message.text}",
        "status": "success"
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=9000)