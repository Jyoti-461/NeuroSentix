from fastapi import APIRouter, UploadFile, File, BackgroundTasks
from app.services.data_processing import process_csv_background
import tempfile

router = APIRouter()

@router.post("/upload-csv")
async def upload_csv(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    with tempfile.NamedTemporaryFile(delete=False, suffix=".csv") as tmp:
        tmp.write(file.file.read())
        file_path = tmp.name
    background_tasks.add_task(process_csv_background, file_path)
    return {"message": "CSV upload started. Processing in background."}