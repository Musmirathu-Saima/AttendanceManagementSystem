import os
import cv2
from deepface import DeepFace
from numpy import dot
from numpy.linalg import norm
# import cv2
import numpy as np
# from deepface import DeepFace
# from numpy import dot
# from numpy.linalg import norm
from io import BytesIO
from PIL import Image
def cosine_distance(a, b):
    """Calculate cosine distance between two embeddings."""
    return 1 - dot(a, b) / (norm(a) * norm(b))

def load_known_faces(folder="known_faces", model_name="Facenet512"):
    """Load all known faces and store embeddings in a dictionary."""
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
    """Match uploaded face image (bytes) with known faces."""
    try:
        # ✅ Convert bytes to NumPy array if needed
        if isinstance(frame, bytes):
            img = Image.open(BytesIO(frame))
            frame = cv2.cvtColor(np.array(img), cv2.COLOR_RGB2BGR)

        # ✅ Save temporary image (optional, helps DeepFace)
        temp_path = "temp.jpg"
        cv2.imwrite(temp_path, frame)

        # ✅ Ensure image actually saved (not blank)
        if os.path.getsize(temp_path) == 0:
            return {
                "success": False,
                "message": "⚠️ temp.jpg is blank — check your uploaded image"
            }

        live_embedding = DeepFace.represent(
            img_path=temp_path,
            model_name=model_name,
            detector_backend="opencv",
            enforce_detection=False
        )[0]["embedding"]

        for name, stored_embedding in known_faces.items():
            distance = cosine_distance(live_embedding, stored_embedding)
            if distance < threshold:
                return {
                    "success": True,
                    "message": f"✅ Face recognized: {name.split('.')[0]}",
                    "confidence": round((1 - distance) * 100, 2),
                    "name": name.split('.')[0]
                }

        return {
            "success": False,
            "message": "❌ Face not recognized"
        }

    except Exception as e:
        return {
            "success": False,
            "message": f"⚠️ Error during face match: {e}"
        }

if __name__ == "__main__":
    print("🟢 Loading known faces...")
    known_faces = load_known_faces()

    if not known_faces:
        print("⚠️ No known faces found. Check the folder path.")
        exit()

    print("📸 Starting webcam...")
    cap = cv2.VideoCapture(0)

    while True:
        ret, frame = cap.read()
        if not ret:
            print("⚠️ Unable to access webcam.")
            break

        result = match_face(frame, known_faces)
        cv2.putText(
            frame,
            result["message"],
            (50, 50),
            cv2.FONT_HERSHEY_SIMPLEX,
            1,
            (0, 255, 0),
            2
        )
        cv2.imshow("Face Recognition", frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()
