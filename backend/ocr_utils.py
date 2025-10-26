import cv2
import numpy as np
import pytesseract
from pathlib import Path
import os

pytesseract.pytesseract.tesseract_cmd = "/usr/local/bin/tesseract"
os.environ["TESSDATA_PREFIX"] = "/Users/admin/Downloads/MLBASEDATTENDANCESYSTEMOCRIDFEATURE/tessdata"

def extract_text_from_id_card(image_bytes):
    """Extract text from ID card image using OCR"""
    try:
        # Convert bytes to numpy array
        nparr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_GRAYSCALE)
        
        if image is None:
            return {
                "success": False,
                "message": "Failed to decode image",
                "text": " "
            }
        
        # Preprocess image for better OCR
        processed_img = cv2.adaptiveThreshold(
            image, 255,
            cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY, 11, 2
        )
        
        # Apply OCR
        custom_config = r'--oem 3 --psm 6'
        text = pytesseract.image_to_string(
            processed_img, 
            config=custom_config, 
            lang='eng'
        )
        
        if not text.strip():
            return {
                "success": False,
                "message": "No text detected in image",
                "text": " "
            }
        
        return {
            "success": True,
            "message": "✅ Text extracted successfully",
            "text": text.strip()
        }
        
    except Exception as e:
        return {
            "success": False,
            "message": f"⚠️ Error during OCR: {str(e)}",
            "text": " ",
            "error": str(e)
        }


def parse_id_card_info(text):
    """Parse extracted text to find common ID card fields"""
    info = {
        "name": None,
        "id_number": None,
        "raw_text": text
    }
    
    lines = text.split()
    
    # Simple parsing logic - can be enhanced based on ID card format
    for i, line in enumerate(lines):
        line = line.strip()
        if not line:
            continue
            
        # Look for name patterns
        if any(keyword in line.upper() for keyword in ['NAME', 'NOME', 'NAAM']):
            if i + 1 < len(lines):
                info['name'] = lines[i + 1].strip()
            elif ':' in line:
                info['name'] = line.split(':', 1)[1].strip()
        
        # Look for ID number patterns
        if any(keyword in line.upper() for keyword in ['ID', 'NUMBER', 'NO.']):
            if i + 1 < len(lines):
                info['id_number'] = lines[i + 1].strip()
            elif ':' in line:
                info['id_number'] = line.split(':', 1)[1].strip()
    
    return info
