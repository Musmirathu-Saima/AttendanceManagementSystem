"#!/bin/bash

# Script to help add known faces to the system

echo \"🤖 Known Faces Setup Helper\"
echo \"==============================\"
echo \"\"
echo \"This script helps you add known faces to the attendance system.\"
echo \"Known faces folder: /app/backend/known_faces/\"
echo \"\"

KNOWN_FACES_DIR=\"/app/backend/known_faces\"

# Check if folder exists
if [ ! -d \"$KNOWN_FACES_DIR\" ]; then
    echo \"Creating known_faces directory...\"
    mkdir -p \"$KNOWN_FACES_DIR\"
fi

# Show current faces
echo \"📋 Currently loaded faces:\"
if [ -z \"$(ls -A $KNOWN_FACES_DIR 2>/dev/null)\" ]; then
    echo \"   ⚠️  No faces found!\"
else
    ls -1 \"$KNOWN_FACES_DIR\" | grep -E '\.(jpg|jpeg|png)$' | sed 's/\.[^.]*$//' | nl
fi

echo \"\"
echo \"📝 Instructions to add faces:\"
echo \"   1. Place face images (jpg, jpeg, or png) in: $KNOWN_FACES_DIR\"
echo \"   2. Name files as: firstname_lastname.jpg\"
echo \"      Example: john_doe.jpg, alice_smith.png\"
echo \"   3. Ensure images have clear, well-lit faces\"
echo \"   4. Restart backend: sudo supervisorctl restart backend\"
echo \"\"
echo \"💡 Tips for best results:\"
echo \"   - Use high-quality images\"
echo \"   - Face should be clearly visible\"
echo \"   - Good lighting conditions\"
echo \"   - Frontal face view preferred\"
echo \"\"

# Count faces
FACE_COUNT=$(ls -1 \"$KNOWN_FACES_DIR\" 2>/dev/null | grep -E '\.(jpg|jpeg|png)$' | wc -l)
echo \"✅ Total known faces: $FACE_COUNT\"

if [ $FACE_COUNT -eq 0 ]; then
    echo \"\"
    echo \"⚠️  WARNING: No known faces loaded!\"
    echo \"   The face recognition system will not work without known faces.\"
    echo \"   Please add face images to $KNOWN_FACES_DIR\"
fi
"