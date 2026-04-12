from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from app.config.db import collection
from app.services.wordcloud_service import get_wordcloud_image  # ← updated name

router = APIRouter()

@router.get("/wordcloud")
def wordcloud():
    img = get_wordcloud_image()  # ← called inside function, not at module level
    return StreamingResponse(img, media_type="image/png")

@router.get("/all-data")
def get_all_data():
    return list(collection.find({}, {"_id": 0}))