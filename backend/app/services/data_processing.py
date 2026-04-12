from datetime import datetime
from app.services.sentiment_service import analyze_sentiment
from app.config.db import collection
from concurrent.futures import ThreadPoolExecutor
import pandas as pd

BATCH_SIZE = 100
CHUNK_SIZE = 500

executor = ThreadPoolExecutor(max_workers=4)


# 🚀 ENTRY FUNCTION
def process_csv_background(file_path):
    executor.submit(_process, file_path)


# 🚀 CORE PROCESS
def _process(file_path):
    try:
        chunks = pd.read_csv(file_path, chunksize=CHUNK_SIZE)

        for chunk in chunks:
            _process_chunk(chunk)

    except Exception as e:
        print("❌ CSV processing failed:", e)


# 🚀 PROCESS EACH CHUNK
def _process_chunk(df):
    batch = []

    for _, row in df.iterrows():
        try:
            text = str(row.get("text", "")).strip()

            if not text:
                continue

            result = analyze_sentiment(text)

            batch.append({
                "text": text,
                "sentiment": result["sentiment"],
                "score": result["score"],
                "created_at": datetime.utcnow()
            })

            if len(batch) >= BATCH_SIZE:
                collection.insert_many(batch)
                batch = []

        except Exception as e:
            print("⚠️ Row error:", e)

    if batch:
        collection.insert_many(batch)