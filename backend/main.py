import os
import cv2
from deepface import DeepFace
from numpy import dot
from numpy.linalg import norm

def cosine_distance(a, b):
    return 1 - dot(a, b) / (norm(a) * norm(b))

def load_known_faces(folder="known_faces", model_name="Facenet512"):
    # Get absolute path to the folder relative to this script
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
        cv2.putText(frame, result, (50, 50), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        cv2.imshow("Face Recognition", frame)

        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

def main():
    print("Running facial recognition...")
    known_faces = load_known_faces()
    cap = cv2.VideoCapture(0)

    while True:
        ret, frame = cap.read()
        if not ret:
            break
        result = match_face(frame, known_faces)
        cv2.putText(frame, result, (30, 40),
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        cv2.imshow("Facial Recognition", frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()
    return "Facial recognition complete"
