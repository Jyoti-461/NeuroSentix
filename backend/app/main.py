from app.services.twitter_service import extract_tweet_id, fetch_replies
from datetime import datetime
from app.services.sentiment_service import analyze_sentiment
from app.config.db import collection
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import sentiment, upload, analytics

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://neuro-sentix.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# allow_origins=[
#     "*"
# ]

# include routers
app.include_router(sentiment.router)
app.include_router(upload.router)
app.include_router(analytics.router)

# Flask
# @app.route("/health")
# def health():
#     return {"status": "ok"}, 200

# FastAPI
@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/analyze-tweet-link")
def analyze_tweet_link(data: dict):
    try:
        url = data.get("url")

        if not url:
            return {"error": "URL required"}

        tweet_id = extract_tweet_id(url)

        if not tweet_id:
            return {"error": "Invalid Tweet URL"}

        # ⚠️ TEMP TEST (REMOVE snscrape issue)
        try:
            replies = fetch_replies(tweet_id)
        except Exception as e:
            print("SCRAPE ERROR:", str(e))  # 🔥 ADD THIS
            return {"error": str(e)}

        if not replies:
            return {"message": "No replies found", "count": 0}

        results = []

        for r in replies:
            sentiment = analyze_sentiment(r["text"])

            doc = {
                "text": r["text"],
                "sentiment": sentiment["sentiment"],
                "score": sentiment["score"],
                "created_at": datetime.utcnow(),
                "source": "twitter_reply"
            }

            collection.insert_one(doc)
            results.append(doc)

        return {
            "message": f"{len(results)} replies analyzed",
            "count": len(results)
        }

    except Exception as e:
        print("ERROR:", str(e))
        return {"error": str(e)}