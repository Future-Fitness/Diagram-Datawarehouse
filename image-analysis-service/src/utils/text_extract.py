import cv2
import re
import paddleocr

# Initialize PaddleOCR
ocr = paddleocr.OCR(use_angle_cls=True, lang="en")

# ✅ Function to Extract Text from Image
def extract_text(image_path):
    """
    Extracts textual content from an image using PaddleOCR.

    :param image_path: Path to the image file.
    :return: Extracted text as a string.
    """
    try:
        image = cv2.imread(image_path)
        results = ocr.ocr(image, cls=True)

        extracted_text = []
        for line in results:
            for word_info in line:
                extracted_text.append(word_info[1][0])  # Extract detected text

        return " ".join(extracted_text)

    except Exception as e:
        return {"error": str(e)}

# ✅ Function to Extract Mathematical Symbols
def extract_math_symbols(image_path):
    """
    Extracts mathematical symbols and operators from an image.

    :param image_path: Path to the image file.
    :return: List of detected mathematical symbols.
    """
    try:
        image = cv2.imread(image_path)
        results = ocr.ocr(image, cls=True)

        math_symbols_pattern = r'[∑∫∆π±√÷×∂≠≈≤≥∞∝]'
        extracted_symbols = []

        for line in results:
            for word_info in line:
                text = word_info[1][0]
                symbols = re.findall(math_symbols_pattern, text)
                extracted_symbols.extend(symbols)

        return list(set(extracted_symbols))  # Remove duplicates

    except Exception as e:
        return {"error": str(e)}
