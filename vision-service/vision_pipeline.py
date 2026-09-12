import cv2
import numpy as np
import pytesseract

def extract_text_from_image(image_bytes: bytes) -> str:
    # 1. Convert byte stream to OpenCV NumPy array
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    # 2. Resize image (Tesseract works best with text height around 30-32 pixels)
    # Scaling up helps Tesseract catch small printed ingredients and license numbers
    img = cv2.resize(img, None, fx=1.5, fy=1.5, interpolation=cv2.INTER_CUBIC)
    
    # 3. Convert to Grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # 4. Slight Blur to remove background foil noise BEFORE contrast
    blurred = cv2.GaussianBlur(gray, (5, 5), 0)
    
    # 5. Adaptive Contrast (CLAHE)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    contrast_enhanced = clahe.apply(blurred)
    
    # 6. Otsu's Binarization
    _, thresh = cv2.threshold(contrast_enhanced, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    
    # 7. Morphological Dilation (Connects broken parts of letters)
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (2, 2))
    processed_img = cv2.dilate(thresh, kernel, iterations=1)
    
    pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
    
    # 8. Extract raw text using PSM 11 (Sparse Text) and OEM 3 (Default Engine)
    custom_config = r'--oem 3 --psm 11'
    raw_ocr_text = pytesseract.image_to_string(processed_img, config=custom_config)
    
    return " ".join(raw_ocr_text.split())