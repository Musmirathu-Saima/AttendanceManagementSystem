import os
import cv2
import numpy as np
from deepface import DeepFace
from numpy import dot
from numpy.linalg import norm
from pathlib import Path

def cosine_distance(a, b):
    """Compute cosine distance between two embeddings"""
    return 1 - dot(a, b) / (norm(a) * norm(b))


def load_known_faces(folder="known_faces", model_name="Facenet512"):
    """Load all images from known_faces folder and store embeddings"""
    base_dir = Path(__file__).parent
    folder_path = base_dir / folder
    face_db = {}

    if not folder_path.is_dir():
        print(f"❌ Folder not found: {folder_path}")
        folder_path.mkdir(parents=True, exist_ok=True)
        return face_db

    print(f"📁 Loading known faces from: {folder_path}")

    for filename in os.listdir(folder_path):
        filepath = folder_path / filename
        if filename.lower().endswith(('.jpg', '.jpeg', '.png')):
            try:
                embedding_data = DeepFace.represent(
                    img_path=str(filepath),
                    model_name=model_name,
                    detector_backend="retinaface",  # ✅ better accuracy
                    enforce_detection=True
                )

                if embedding_data and len(embedding_data) > 0:
                    embedding = embedding_data[0]["embedding"]
                    face_db[filename] = embedding
                    print(f"✅ Loaded face: {filename} → embedding length: {len(embedding)}")
                else:
                    print(f"⚠️ No face detected in {filename}")

            except Exception as e:
                print(f"⚠️ Error loading {filename}: {e}")

    # 🟩 Added debug line here
    print("✅ Loaded embeddings for:", list(face_db.keys()))

    print(f"✅ Total known faces loaded: {len(face_db)}")
    return face_db

def match_face(image_bytes, known_faces, model_name="Facenet512", threshold=0.45):
    """Compare uploaded image with stored embeddings"""
    try:
        # Convert bytes to numpy array
        nparr = np.frombuffer(image_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        if frame is None:
            return {"success": False, "message": "Failed to decode image"}

        # Save temporarily for DeepFace
        temp_path = "/tmp/temp_face.jpg"
        cv2.imwrite(temp_path, frame)

        # Get live embedding
        live_embedding_data = DeepFace.represent(
            img_path=temp_path,
            model_name=model_name,
            detector_backend="retinaface",  # ✅ better accuracy
            enforce_detection=True
        )

        if not live_embedding_data or len(live_embedding_data) == 0:
            return {"success": False, "message": "No face detected in live capture"}

        live_embedding = live_embedding_data[0]["embedding"]

        # Match against known faces
        best_match = None
        best_distance = float('inf')

        for name, stored_embedding in known_faces.items():
            distance = cosine_distance(live_embedding, stored_embedding)
            print(f"🔍 Comparing with {name}: distance={round(distance, 4)}")

            if distance < threshold and distance < best_distance:
                best_distance = distance
                best_match = name.split('.')[0]

        # 🟩 Added debug line here (before returning result)
        print(f"📊 Best match: {best_match}, distance={best_distance}")

        # Clean up temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)

        # Return result
        if best_match:
            return {
                "success": True,
                "message": f"✅ Match Found: {best_match}",
                "name": best_match,
                "confidence": round((1 - best_distance) * 100, 2)
            }
        else:
            return {
                "success": False,
                "message": "❌ No Match Found",
                "name": None
            }

    except Exception as e:
        return {
            "success": False,
            "message": f"⚠️ Error during face match: {str(e)}",
            "error": str(e)
        }
