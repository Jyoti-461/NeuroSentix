from fastapi import APIRouter
from app.models.schema import TextInput
from app.services.sentiment_service import analyze_sentiment
from app.config.db import collection
from datetime import datetime

router = APIRouter()

@router.post("/analyze")
def analyze(data: TextInput):
    result = analyze_sentiment(data.text)

    document = {
        "text": data.text,
        "sentiment": result["sentiment"],
        "score": result["score"],
        "created_at": datetime.utcnow()
    }

    collection.insert_one(document)

    return result