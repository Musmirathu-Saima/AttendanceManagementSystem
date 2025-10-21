import cv2
import pytesseract
import os
from PIL import Image

def identify():
    # Configure Tesseract
    pytesseract.pytesseract.tesseract_cmd = "/usr/local/bin/tesseract"
    os.environ["TESSDATA_PREFIX"] = "/Users/admin/Downloads/MLBASEDATTENDANCESYSTEMOCRIDFEATURE/tessdata"

    # Start webcam
    cap = cv2.VideoCapture(0)
    cv2.namedWindow("test")
    img_counter = 0

    print("[INFO] Tesseract:", pytesseract.pytesseract.tesseract_cmd)
    print("[INFO] TESSDATA_PREFIX:", os.environ["TESSDATA_PREFIX"])
    print("[INFO] Show your ID card to the webcam. Press 'q' to quit.")

    while True:
        ret, frame = cap.read()
        if not ret:
            break
        cv2.imshow("ID Card OCR", frame)
        k = cv2.waitKey(1)

        if k%256 == 27:
            # ESC pressed
            print("Escape hit, closing...")
            break
        elif k%256 == 32:
            # SPACE pressed
            img_name = "opencv_frame_{}.png".format(img_counter)
            cv2.imwrite(img_name, frame)
            print("{} written!".format(img_name))
            img_counter += 1

            img = cv2.imread(img_name,cv2.IMREAD_GRAYSCALE)
            ret, modified_image = cv2.threshold(img, 120, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
            modified_image= cv2.resize(modified_image, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)

            #cv.imshow("image", image)
            #cv.imshow("modified_image", modified_image)
            cv2.imwrite("modified_image.png", modified_image)

            pytesseract.pytesseract.tesseract_cmd = r'/usr/local/bin/tesseract'

            text = pytesseract.image_to_string(Image.open('modified_image.png'), config="--psm 6 --oem 3", lang="eng")

            print(f'Text: {text}')
            if "MUSMIRATHU SAIMA N" in text:
                print("Success")
            else:
                print("Failed") 
                break



    cap.release()
    cv2.destroyAllWindows()

