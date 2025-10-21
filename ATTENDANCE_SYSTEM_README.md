"# 🤖 Student Attendance Management System

A futuristic AI-powered attendance system using **Face Recognition** and **ID Card OCR** for dual verification.

## 🌟 Features

### 1. **Face Recognition**
- Real-time webcam face detection
- Deep learning-based face matching using DeepFace (Facenet512 model)
- Cosine distance similarity matching
- Confidence score display

### 2. **ID Card OCR**
- Automatic text extraction from ID cards using Tesseract OCR
- Image preprocessing for better accuracy
- Parsing of name and ID number from extracted text
- Support for multiple ID card formats

### 3. **Dual Verification Workflow**
1. Student shows face to camera → System matches against known faces
2. After successful face match → Student shows ID card
3. System extracts and verifies ID information
4. Attendance is recorded in MongoDB with both verifications

### 4. **Dashboard**
- Real-time attendance statistics
- Total students, on-time percentage, present/late counts
- Beautiful futuristic UI with animated robots

## 🏗️ Architecture

### Backend (FastAPI)
- **Framework**: FastAPI (Python 3.11)
- **Database**: MongoDB
- **AI/ML Libraries**:
  - `opencv-cv2` - Camera and image processing
  - `deepface` - Face recognition
  - `pytesseract` - OCR text extraction
  - `tensorflow` - Deep learning models

### Frontend (React)
- **Framework**: React 19
- **Styling**: Tailwind CSS with custom animations
- **Components**:
  - Dashboard - Main view with stats
  - FaceRecognition - Webcam face capture
  - IDCardScanner - ID card capture and OCR
  - AttendanceSuccess - Confirmation screen

## 📁 Project Structure

```
/app/
├── backend/
│   ├── server.py                      # Main FastAPI application
│   ├── face_recognition_utils.py      # Face matching logic
│   ├── ocr_utils.py                   # ID card OCR logic
│   ├── known_faces/                   # Folder for reference face images
│   ├── requirements.txt               # Python dependencies
│   └── .env                           # Environment variables
├── frontend/
│   ├── src/
│   │   ├── App.js                     # Main app with routing logic
│   │   ├── components/
│   │   │   ├── Dashboard.js           # Dashboard UI
│   │   │   ├── FaceRecognition.js     # Face recognition component
│   │   │   ├── IDCardScanner.js       # ID scanner component
│   │   │   └── AttendanceSuccess.js   # Success screen
│   │   ├── index.js                   # Entry point
│   │   └── index.css                  # Global styles
│   └── package.json                   # Node dependencies
└── README.md
```

## 🚀 Setup Instructions

### 1. Add Known Faces
Place reference face images in `/app/backend/known_faces/` folder:
- Supported formats: `.jpg`, `.jpeg`, `.png`
- File name will be used as student name (e.g., `john_doe.jpg` → \"john_doe\")
- Images should have clear, well-lit faces

Example:
```bash
/app/backend/known_faces/
├── alice_smith.jpg
├── bob_johnson.jpg
├── charlie_brown.jpg
└── diana_prince.jpg
```

### 2. Backend Dependencies
All dependencies are already installed. Key packages:
- `opencv-python-headless` - Image processing
- `deepface` - Face recognition
- `pytesseract` - OCR
- `tensorflow` - ML models
- `fastapi` - Web framework

### 3. Tesseract OCR
Tesseract is installed and configured at `/usr/bin/tesseract`

### 4. Start Services
```bash
# Restart both services
sudo supervisorctl restart all

# Check status
sudo supervisorctl status
```

## 📡 API Endpoints

### Face Recognition
- `POST /api/face-recognition` - Upload face image for recognition
  - Input: multipart/form-data with 'file'
  - Output: `{success, message, name, confidence}`

### ID Card OCR
- `POST /api/id-card-ocr` - Upload ID card for text extraction
  - Input: multipart/form-data with 'file'
  - Output: `{success, message, text, parsed: {name, id_number}}`

### Attendance
- `POST /api/attendance/record` - Record attendance
- `GET /api/attendance/records` - Get all attendance records
- `GET /api/attendance/stats` - Get attendance statistics

### Utility
- `GET /api/known-faces-count` - Get count of loaded known faces
- `GET /api/` - Health check

## 🎯 User Workflow

1. **Open the application** in browser
2. **Click \"Facial Recognition\"** button
3. **Position face in camera** and click \"Capture & Recognize\"
4. If face matches, automatically proceeds to **ID Card Scanner**
5. **Hold ID card in camera** and click \"Capture & Scan ID\"
6. System extracts text and records attendance
7. **Success screen** shows both verifications
8. Click \"Back to Dashboard\" to return

## 🔧 Configuration

### Face Recognition Settings
Edit `/app/backend/face_recognition_utils.py`:
- `model_name`: Default is \"Facenet512\" (most accurate)
  - Other options: \"VGG-Face\", \"Facenet\", \"OpenFace\", \"DeepFace\"
- `threshold`: Default is 0.35 (lower = stricter matching)
  - Range: 0.0 to 1.0

### OCR Settings
Edit `/app/backend/ocr_utils.py`:
- `config`: Tesseract OCR mode
  - Current: `--oem 3 --psm 6` (assumes uniform text block)
  - `psm 6`: Uniform block of text
  - `psm 4`: Single column of text

## 📊 Database Schema

### Attendance Records Collection
```javascript
{
  \"id\": \"uuid\",
  \"student_name\": \"string\",
  \"face_match_confidence\": \"float (0-100)\",
  \"id_card_text\": \"string (raw OCR text)\",
  \"id_card_name\": \"string (parsed name)\",
  \"id_card_number\": \"string (parsed ID)\",
  \"verified\": \"boolean\",
  \"timestamp\": \"ISO datetime string\"
}
```

## 🎨 UI Features

- **Futuristic gradient backgrounds** with animated flow
- **Animated robot mascots** moving across screen
- **Glass-morphism cards** with blur effects
- **Real-time camera feeds** with mirrored display for face recognition
- **Confidence indicators** for face matches
- **Responsive design** for all screen sizes

## 🔒 Browser Permissions

The application requires:
- **Camera access** for both face recognition and ID card scanning
- Ensure browser has camera permissions granted

## 🐛 Troubleshooting

### No known faces loaded
- Check `/app/backend/known_faces/` folder exists
- Ensure face images are in `.jpg`, `.jpeg`, or `.png` format
- Check backend logs: `tail -f /var/log/supervisor/backend.err.log`

### Face recognition not working
- Ensure good lighting for camera
- Face should be clearly visible and looking at camera
- Try lowering threshold in `face_recognition_utils.py`

### OCR not extracting text
- Ensure ID card is well-lit and in focus
- Hold card steady when capturing
- Try preprocessing settings in `ocr_utils.py`

### Camera not accessible
- Check browser camera permissions
- Ensure no other application is using camera
- Try different browser (Chrome/Firefox recommended)

## 📈 Future Enhancements

- [ ] Add student registration interface
- [ ] Real-time video streaming for continuous monitoring
- [ ] Multiple face detection in single frame
- [ ] QR code support on ID cards
- [ ] Export attendance reports (Excel/PDF)
- [ ] SMS/Email notifications to students
- [ ] Admin panel for managing students
- [ ] Attendance analytics and insights

## 🙌 Technologies Used

- **Backend**: FastAPI, Python 3.11
- **Frontend**: React 19, Tailwind CSS
- **Database**: MongoDB
- **Face Recognition**: DeepFace (Facenet512)
- **OCR**: Tesseract OCR
- **Image Processing**: OpenCV
- **Deep Learning**: TensorFlow, Keras

## 📞 Support

Check logs for debugging:
```bash
# Backend logs
tail -f /var/log/supervisor/backend.err.log

# Frontend logs
tail -f /var/log/supervisor/frontend.out.log

# All services status
sudo supervisorctl status
```

---

**Built with ❤️ using AI-powered attendance technology** 🤖
"