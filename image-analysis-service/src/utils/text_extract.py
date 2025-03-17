import cv2
import re
from paddleocr import PaddleOCR

# Initialize PaddleOCR correctly
ocr = PaddleOCR(use_angle_cls=True, lang="en")

# ✅ Function to Extract Text from Image
def extract_text(image_path):
    """
    Extracts textual content from an image using PaddleOCR.

    :param image_path: Path to the image file.
    :return: Extracted text as a string.
    """
    try:
        # Ensure image exists
        image = cv2.imread(image_path)
        if image is None:
            return {"error": "Failed to load image. Check file path."}

        results = ocr.ocr(image_path)  # ✅ Correct usage (pass file path)

        extracted_text = []
        for line in results:
            if isinstance(line, list):  # Ensure valid format
                for word_info in line:
                    if isinstance(word_info, list) and len(word_info) > 1:
                        extracted_text.append(word_info[1][0])  # Extract detected text

        return " ".join(extracted_text) if extracted_text else {"error": "No text detected."}

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
        # Ensure image exists
        image = cv2.imread(image_path)
        if image is None:
            return {"error": "Failed to load image. Check file path."}

        results = ocr.ocr(image_path)  # ✅ Correct usage

        math_symbols_pattern = r'[∑∫∆π±√÷×∂≠≈≤≥∞∝∑∏∂∃∄∅∇∠∧∨⊥⊂⊆⊄⊃⊇∪∩⊕⊗⊖⊛⊚⊘⊙]'
        extracted_symbols = []

        for line in results:
            if isinstance(line, list):  # Ensure valid format
                for word_info in line:
                    if isinstance(word_info, list) and len(word_info) > 1:
                        text = word_info[1][0]
                        symbols = re.findall(math_symbols_pattern, text)
                        extracted_symbols.extend(symbols)

        return list(set(extracted_symbols)) if extracted_symbols else {"error": "No mathematical symbols detected."}

    except Exception as e:
        return {"error": str(e)}
