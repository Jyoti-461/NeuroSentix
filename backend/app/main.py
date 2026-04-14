

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
@app.route("/health")
def health():
    return {"status": "ok"}, 200

# FastAPI
@app.get("/health")
def health():
    return {"status": "ok"}