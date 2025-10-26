from main import main as face_recognition_main
from flask import Flask, request, jsonify, render_template, Response
from flask_cors import CORS, cross_origin
import os
import cv2
import numpy as np
import pytesseract
from deepface import DeepFace
from numpy import dot
from numpy.linalg import norm

# ---------------- INITIAL SETUP ---------------- #
app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Configure Tesseract
pytesseract.pytesseract.tesseract_cmd = "/usr/local/bin/tesseract"
os.environ["TESSDATA_PREFIX"] = "/Users/admin/Downloads/MLBASEDATTENDANCESYSTEMOCRIDFEATURE/tessdata"


# ---------------- HELPER FUNCTIONS ---------------- #
def cosine_distance(a, b):
    """Compute cosine distance between two embeddings"""
    return 1 - dot(a, b) / (norm(a) * norm(b))

def load_known_faces(folder="known_faces", model_name="Facenet512"):
    """Load all images from known_faces folder and store embeddings"""
    base_dir = os.path.dirname(os.path.abspath(__file__))
    folder_path = os.path.join(base_dir, folder)
    face_db = {}

    if not os.path.isdir(folder_path):
        print(f"❌ Folder not found: {folder_path}")
        return face_db

    for filename in os.listdir(folder_path):
        filepath = os.path.join(folder_path, filename)
        if filename.lower().endswith(('.jpg', '.jpeg', '.png')):
            try:
                embedding = DeepFace.represent(
                    img_path=filepath,
                    model_name=model_name,
                    detector_backend="opencv",
                    enforce_detection=False
                )[0]["embedding"]
                face_db[filename] = embedding
                print(f"✅ Loaded: {filename}")
            except Exception as e:
                print(f"⚠️ Error loading {filename}: {e}")
    return face_db


def match_face(frame, known_faces, model_name="Facenet512", threshold=0.35):
    """Compare live webcam frame with stored embeddings"""
    try:
        cv2.imwrite("temp.jpg", frame)
        live_embedding = DeepFace.represent(
            img_path="temp.jpg",
            model_name=model_name,
            detector_backend="opencv",
            enforce_detection=False
        )[0]["embedding"]

        for name, stored_embedding in known_faces.items():
            distance = cosine_distance(live_embedding, stored_embedding)
            if distance < threshold:
                return f"✅ Match Found: {name.split('.')[0]}"
        return "❌ No Match Found"
    except Exception as e:
        return f"⚠️ Error during face match: {e}"


# Load known faces once at startup
known_faces = load_known_faces()


# ---------------- ROUTE: HOME ---------------- #
@app.route("/")
def home():
    return "🚀 Flask is running with both Face Recognition and OCR!"


# ---------------- ROUTE: FACE RECOGNITION ---------------- #
def gen_frames():
    """Generate webcam frames for live feed"""
    cap = cv2.VideoCapture(0)
    while True:
        success, frame = cap.read()
        if not success:
            break
        else:
            result = match_face(frame, known_faces)
            cv2.putText(frame, result, (30, 40),
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
            ret, buffer = cv2.imencode('.jpg', frame)
            frame = buffer.tobytes()
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n')


@app.route('/face_feed')
def face_feed():
    """Route for webcam feed"""
    return Response(gen_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')


@app.route('/face_recognition')
def face_recognition_page():
    """Face recognition webpage"""
    return render_template('face_recognition.html')


# ---------------- ROUTE: FACIAL RECOGNITION (CALLS main.py) ---------------- #
@app.route('/facial_recognition')
def facial_recognition():
    """Trigger the main.py-based facial recognition"""
    result = face_recognition_main()   # calls your main.py facial recognition
    return render_template('face.html', result=result)


# ---------------- ROUTE: ID CARD OCR UPLOAD ---------------- #
@app.route('/upload', methods=['POST'])
@cross_origin()
def upload_and_process_image():
    """Handle ID card upload and text extraction"""
    if 'photo' not in request.files:
        return jsonify({'error': 'No photo uploaded'}), 400

    file = request.files['photo']
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400

    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)

    image = cv2.imread(file_path, cv2.IMREAD_GRAYSCALE)
    if image is None:
        return jsonify({'error': 'Failed to read image'}), 500

    processed_img = cv2.adaptiveThreshold(
        image, 255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY, 11, 2)

    custom_config = r'--oem 3 --psm 6'
    text = pytesseract.image_to_string(processed_img, config=custom_config, lang='eng')

    print(f"[OCR TEXT]:\n{text}")
    return jsonify({'text': text})


# ---------------- MAIN ---------------- #
if __name__ == "__main__":
    app.run(debug=True)
