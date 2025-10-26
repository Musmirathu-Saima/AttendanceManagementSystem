from fastapi import FastAPI, APIRouter, File, UploadFile, HTTPException
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
from datetime import datetime, timezone
import uuid
import os
import logging
import uvicorn

from face_recognition_utils import load_known_faces, match_face
from ocr_utils import extract_text_from_id_card, parse_id_card_info

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB setup
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

# App initialization
app = FastAPI(title="Face Recognition Attendance API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize known faces
print("🔄 Loading known faces database...")
known_faces_db = load_known_faces(folder="/Users/admin/Downloads/app/backend/known_faces")
print(f"✅ Loaded {len(known_faces_db)} known faces")

# Router setup
api_router = APIRouter(prefix="/api")

# ----------- MODELS ------------
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

class AttendanceRecord(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    student_name: str
    face_match_confidence: Optional[float] = None
    verified: bool
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ----------- ROUTES ------------

@api_router.get("/")
async def root():
    return {"message": "🤖 Face Recognition Attendance API is running"}

@api_router.post("/face-recognition")
async def recognize_face(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()
        result = match_face(image_bytes, known_faces_db)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/known-faces-count")
async def get_known_faces_count():
    return {"count": len(known_faces_db), "faces": list(known_faces_db.keys())}

@api_router.post("/attendance/record")
async def record_attendance(
    student_name: str,
    face_confidence: Optional[float] = None,
    verified: bool = True
):
    try:
        attendance = AttendanceRecord(
            student_name=student_name,
            face_match_confidence=face_confidence,
            verified=verified
        )
        doc = attendance.model_dump()
        doc["timestamp"] = doc["timestamp"].isoformat()
        await db.attendance_records.insert_one(doc)
        return {"success": True, "record": attendance}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/attendance/stats")
async def get_attendance_stats():
    try:
        today = datetime.now(timezone.utc).date()
        all_records = await db.attendance_records.find({}, {"_id": 0}).to_list(1000)
        today_records = [
            r for r in all_records if datetime.fromisoformat(r["timestamp"]).date() == today
        ]

        total_students = 120  # adjust as needed
        on_time_today = len([r for r in today_records if r.get("verified", False)])
        late_today = len(today_records) - on_time_today
        on_time_percentage = (
            round((on_time_today / total_students * 100), 1)
            if total_students > 0 else 0
        )

        return {
            "total_students": total_students,
            "on_time_percentage": on_time_percentage,
            "on_time_today": on_time_today,
            "late_today": late_today,
            "present_today": len(today_records),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@api_router.post("/ocr/id-card")
async def extract_id_card_info(file: UploadFile = File(...)):
    """
    Extract text and key fields (like name, ID number) from uploaded ID card image.
    """
    try:
        image_bytes = await file.read()
        
        # Step 1: Extract raw text using OCR
        ocr_result = extract_text_from_id_card(image_bytes)
        if not ocr_result["success"]:
            return ocr_result
        
        # Step 2: Parse text into structured info
        parsed_info = parse_id_card_info(ocr_result["text"])
        
        return {
            "success": True,
            "message": "✅ ID card processed successfully",
            "ocr_text": ocr_result["text"],
            "parsed_info": parsed_info
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OCR processing error: {str(e)}")

# Include API router
app.include_router(api_router)

# Run app for Docker
if __name__ == "__main__":
    print("🚀 Starting FastAPI server on 0.0.0.0:5000")
    uvicorn.run(app, host="0.0.0.0", port=5000)
