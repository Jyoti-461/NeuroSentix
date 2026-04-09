from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi import File, UploadFile
import pandas as pd
from datetime import datetime

from app.config.db import collection
from app.services.sentiment_service import analyze_sentiment

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all (dev only)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Request body schema
class TextInput(BaseModel):
    text: str


@app.get("/")
def home():
    return {"message": "Backend running 🚀"}


@app.get("/test-db")
def test_db():
    collection.insert_one({"test": "working"})
    return {"status": "MongoDB connected"}

@app.get("/all-data")
def get_all_data():
    data = list(collection.find({}, {"_id": 0}))
    return data

#csv upload endpoint
@app.post("/upload-csv")
async def upload_csv(file: UploadFile = File(...)):
    
    df = pd.read_csv(file.file)

    results = []

    for _, row in df.iterrows():
        text = str(row.get("text", ""))

        if not text.strip():
            continue

        try:
            result = analyze_sentiment(text)

            document = {
                "text": text,
                "sentiment": result["sentiment"],
                "score": result["score"],
                "created_at": datetime.utcnow()
            }

            collection.insert_one(document)

            results.append(document)

        except Exception as e:
            print("Error processing row:", e)

    return {
        "message": "CSV processed successfully",
        "count": len(results)
    }

# 🚀 MAIN SENTIMENT API
@app.post("/analyze")
def analyze(data: TextInput):
    
    result = analyze_sentiment(data.text)
    
    # Store in DB
    document = {
        "text": data.text,
        "sentiment": result["sentiment"],
        "score": result["score"],
        "created_at": datetime.utcnow()
    }
    
    collection.insert_one(document)
    
    return result