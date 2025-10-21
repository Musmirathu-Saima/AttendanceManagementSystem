from fastapi import FastAPI, APIRouter, File, UploadFile, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import uvicorn

# Import our utility modules
from face_recognition_utils import load_known_faces, match_face
from ocr_utils import extract_text_from_id_card, parse_id_card_info


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Load known faces at startup
print("🔄 Loading known faces database...")
# known_faces_db = load_known_faces()
# print(f"✅ Loaded {len(known_faces_db)} known faces")

known_faces_db = load_known_faces()
print(f"✅ Loaded {len(known_faces_db)} known faces")


# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
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
    id_card_text: Optional[str] = None
    id_card_name: Optional[str] = None
    id_card_number: Optional[str] = None
    verified: bool
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    
class AttendanceRecordResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str
    student_name: str
    face_match_confidence: Optional[float] = None
    id_card_name: Optional[str] = None
    id_card_number: Optional[str] = None
    verified: bool
    timestamp: str

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "🤖 Student Attendance System API"}

@api_router.post("status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    return status_checks

@api_router.post("face-recognition")
async def recognize_face(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()
        result = match_face(image_bytes, known_faces_db)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("known-faces-count")
async def get_known_faces_count():
    return {"count": len(known_faces_db), "faces": list(known_faces_db.keys())}

@api_router.post("id-card-ocr")
async def process_id_card(file: UploadFile = File(...)):
    try:
        image_bytes = await file.read()
        ocr_result = extract_text_from_id_card(image_bytes)
        if ocr_result.get('success'):
            ocr_result['parsed'] = parse_id_card_info(ocr_result['text'])
        return ocr_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("attendance/record")
async def record_attendance(
    student_name: str,
    face_confidence: Optional[float] = None,
    id_card_text: Optional[str] = None,
    id_card_name: Optional[str] = None,
    id_card_number: Optional[str] = None,
    verified: bool = True
):
    try:
        attendance = AttendanceRecord(
            student_name=student_name,
            face_match_confidence=face_confidence,
            id_card_text=id_card_text,
            id_card_name=id_card_name,
            id_card_number=id_card_number,
            verified=verified
        )
        doc = attendance.model_dump()
        doc['timestamp'] = doc['timestamp'].isoformat()
        await db.attendance_records.insert_one(doc)
        return {"success": True, "record": attendance}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("attendance/records")
async def get_attendance_records():
    try:
        records = await db.attendance_records.find({}, {"_id": 0}).to_list(1000)
        return {"success": True, "count": len(records), "records": records}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/attendance/stats")
async def get_attendance_stats():
    try:
        today = datetime.now(timezone.utc).date()
        all_records = await db.attendance_records.find({}, {"_id": 0}).to_list(1000)
        today_records = [r for r in all_records if datetime.fromisoformat(r['timestamp']).date() == today]
        
        total_students = 120
        on_time_today = len([r for r in today_records if r.get('verified', False)])
        late_today = len(today_records) - on_time_today
        on_time_percentage = round((on_time_today / total_students * 100), 1) if total_students > 0 else 0
        
        return {
            "total_students": total_students,
            "on_time_percentage": on_time_percentage,
            "on_time_today": on_time_today,
            "late_today": late_today,
            "present_today": len(today_records)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Include the router
app.include_router(api_router)


# ---- Add this block so supervisor / docker can run it directly ----
if __name__ == "__main__":
    print("🚀 Starting FastAPI server on 0.0.0.0:5000")
    uvicorn.run(app, host="0.0.0.0", port=5000)
