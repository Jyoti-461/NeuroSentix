from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi import File, UploadFile
import pandas as pd
from datetime import datetime
from wordcloud import WordCloud
from fastapi.responses import StreamingResponse
import matplotlib.pyplot as plt
import io
from app.config.db import collection
from app.services.sentiment_service import analyze_sentiment


# allow_origins=[
#     "http://localhost:5173",
#     "https://neurosentix.vercel.app"
# ]

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


@app.get("/health")
def health_check():
    return {"status": "OK"}

@app.get("/")
def home():
    return {"message": "Backend running 🚀"}

@app.get("/wordcloud")
def generate_wordcloud():
    data = list(collection.find({}, {"_id": 0}))

    # Combine all text
    text_data = " ".join([item.get("text", "") for item in data])

    if not text_data.strip():
        return {"message": "No data available"}

    # Generate word cloud
    wordcloud = WordCloud(
        width=800,
        height=400,
        background_color="white"
    ).generate(text_data)

    # Convert to image
    img = io.BytesIO()
    plt.imshow(wordcloud, interpolation="bilinear")
    plt.axis("off")
    plt.savefig(img, format="png")
    plt.close()

    img.seek(0)

    return StreamingResponse(img, media_type="image/png")

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