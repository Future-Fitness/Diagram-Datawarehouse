import cv2
import re
import pytesseract

# If using Windows, specify the path to Tesseract (adjust this path if needed)
# pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

# ✅ Function to Extract Text from Image
def extract_text(image_path):
    """
    Extracts textual content from an image using Tesseract OCR.

    :param image_path: Path to the image file.
    :return: Extracted text as a string or an error message.
    """
    try:
        image = cv2.imread(image_path)
        if image is None:
            return {"error": "Failed to load image. Check file path."}

        # Convert image to grayscale for better OCR results
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        # Run OCR using Tesseract
        text = pytesseract.image_to_string(gray)

        return text.strip() if text.strip() else {"error": "No text detected."}

    except Exception as e:
        return {"error": str(e)}

# ✅ Function to Extract Mathematical Symbols
def extract_math_symbols(image_path):
    """
    Extracts mathematical symbols and operators from an image using Tesseract OCR.

    :param image_path: Path to the image file.
    :return: List of detected mathematical symbols.
    """
    try:
        image = cv2.imread(image_path)
        if image is None:
            return {"error": "Failed to load image. Check file path."}

        # Convert image to grayscale for better OCR results
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        # Run OCR using Tesseract
        extracted_text = pytesseract.image_to_string(gray)

        # Define regex pattern for mathematical symbols
        math_symbols_pattern = r'[∑∫∆π±√÷×∂≠≈≤≥∞∝∏∂∃∄∅∇∠∧∨⊥⊂⊆⊄⊃⊇∪∩⊕⊗⊖⊛⊚⊘⊙∈∉∋∌∑∫∂∇∅∥∦⊢⊣⊤⊥⊦⊨⊩⊬⊭⊯⊰⊱⊲⊳⊴⊵⊶⊷∸∹∺∻∼∽∾≀≁≂≃≄≅≆≇≈≉≊≋≌≍≎≏≒≓≔≕≖≗≘≙≚≛≜≝≞≟≠≡≢≤≥≦≧≨≩≪≫≬≭≮≯≰≱⊂⊃⊆⊇⊊⊋⊌⊍⊎⊏⊐⊑⊒]'

        # Find mathematical symbols in the extracted text
        extracted_symbols = re.findall(math_symbols_pattern, extracted_text)

        return list(set(extracted_symbols)) if extracted_symbols else {"error": "No mathematical symbols detected."}

    except Exception as e:
        return {"error": str(e)}

