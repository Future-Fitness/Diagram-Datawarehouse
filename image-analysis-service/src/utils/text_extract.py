# image-analysis-service/src/utils/text_extract.py
import cv2
import re
import pytesseract
import logging
import numpy as np
from PIL import Image
import traceback

# Configure logging
logger = logging.getLogger(__name__)

# If using Windows, specify the path to Tesseract (adjust this path if needed)
# pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

def preprocess_image_for_ocr(image_path):
    """
    Preprocess image to improve OCR results with multiple approaches.
    Returns the best processed image for OCR.
    """
    try:
        # Read the image
        image = cv2.imread(image_path)
        if image is None:
            logger.error(f"Failed to read image at {image_path}")
            # Try with PIL as fallback
            try:
                pil_image = Image.open(image_path)
                image = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)
            except Exception as e:
                logger.error(f"PIL fallback also failed: {str(e)}")
                return None
        
        # Create multiple preprocessed versions
        processed_images = []
        
        # 1. Basic grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        processed_images.append(("basic_gray", gray))
        
        # 2. Grayscale with Gaussian blur to reduce noise
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        processed_images.append(("blurred", blurred))
        
        # 3. Adaptive thresholding
        thresh = cv2.adaptiveThreshold(
            gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
            cv2.THRESH_BINARY, 11, 2
        )
        processed_images.append(("adaptive_thresh", thresh))
        
        # 4. Otsu's thresholding
        _, otsu = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        processed_images.append(("otsu", otsu))
        
        # 5. Morphological operations
        kernel = np.ones((1, 1), np.uint8)
        morph = cv2.morphologyEx(gray, cv2.MORPH_OPEN, kernel)
        processed_images.append(("morph", morph))
        
        # 6. Contrast enhancement
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        enhanced = clahe.apply(gray)
        processed_images.append(("enhanced", enhanced))
        
        return processed_images
        
    except Exception as e:
        logger.error(f"Error preprocessing image: {str(e)}")
        logger.error(traceback.format_exc())
        return None

# ✅ Improved Function to Extract Text from Image
def extract_text(image_path):
    """
    Extracts textual content from an image using Tesseract OCR with multiple preprocessing approaches.
    
    :param image_path: Path to the image file.
    :return: Best extracted text as a string or an error message.
    """
    try:
        # Preprocess the image with multiple approaches
        processed_images = preprocess_image_for_ocr(image_path)
        
        if not processed_images:
            return "No text could be extracted due to image processing error."
        
        # Try all processed images and keep the best result
        best_text = ""
        best_confidence = -1
        best_method = ""
        
        for method, img in processed_images:
            try:
                # Get detailed OCR data to check confidence
                ocr_data = pytesseract.image_to_data(img, output_type=pytesseract.Output.DICT)
                
                # Calculate average confidence of detected text
                confidences = [conf for conf in ocr_data['conf'] if conf != -1]
                avg_confidence = np.mean(confidences) if confidences else 0
                
                # Extract the text
                text = pytesseract.image_to_string(img)
                text = text.strip()
                
                text_length = len(text.replace(" ", "").replace("\n", ""))
                
                # Calculate a score combining confidence and text length
                score = avg_confidence * (1 + min(text_length / 500, 1))
                
                logger.debug(f"Method {method}: confidence={avg_confidence:.2f}, text_length={text_length}, score={score:.2f}")
                
                # Keep track of the best result
                if score > best_confidence and text_length > 0:
                    best_confidence = score
                    best_text = text
                    best_method = method
                    
            except Exception as e:
                logger.warning(f"OCR failed for method {method}: {str(e)}")
        
        if best_text:
            logger.info(f"Best OCR result from method {best_method} with confidence {best_confidence:.2f}")
            return best_text
        else:
            return "No text could be extracted."

    except Exception as e:
        logger.error(f"Error in text extraction: {str(e)}")
        logger.error(traceback.format_exc())
        return "Text extraction failed due to technical error."

# ✅ Improved Function to Extract Mathematical Symbols
def extract_math_symbols(image_path):
    """
    Extracts mathematical symbols and operators from an image using Tesseract OCR with enhanced detection.

    :param image_path: Path to the image file.
    :return: List of detected mathematical symbols.
    """
    try:
        # Preprocess the image with multiple approaches
        processed_images = preprocess_image_for_ocr(image_path)
        
        if not processed_images:
            return []
        
        # Define comprehensive regex pattern for mathematical symbols
        math_symbols_pattern = r'[+\-*/=≠<>≤≥≈±∓×÷≅≡≢≪≫⊂⊃⊆⊇⊄⊅∈∉∋∌∀∃∄∧∨⊕⊗⊙∪∩∞∂∫∬∭∮∇∆√∛∜∑∏∐△▽□◊⟨⟩⟪⟫⌈⌉⌊⌋⟦⟧⟮⟯‖π∝∞°′″]'
        
        # Extended set for specific mathematical notation
        extended_patterns = [
            r'\\[a-zA-Z]+',  # LaTeX commands
            r'[a-zA-Z]_\{[a-zA-Z0-9]+\}',  # Subscripts
            r'[a-zA-Z]\^[a-zA-Z0-9]+',  # Superscripts
            r'\\frac\{[^}]+\}\{[^}]+\}',  # Fractions
            r'\\sqrt\{[^}]+\}'  # Square roots
        ]
        
        all_symbols = set()
        
        # Try all processed images to find math symbols
        for method, img in processed_images:
            try:
                extracted_text = pytesseract.image_to_string(img, config='--psm 6')
                
                # Find all standard math symbols
                symbols = re.findall(math_symbols_pattern, extracted_text)
                all_symbols.update(symbols)
                
                # Look for extended patterns
                for pattern in extended_patterns:
                    matches = re.findall(pattern, extracted_text)
                    all_symbols.update(matches)
                    
            except Exception as e:
                logger.warning(f"Symbol extraction failed for method {method}: {str(e)}")
        
        # Additional processing for math-specific OCR
        try:
            # Try math config for Tesseract
            math_config = r'--psm 6 --oem 3 -c tessedit_char_whitelist=0123456789+-*/()=<>≤≥∞∫∑π{}[]^'
            math_text = pytesseract.image_to_string(processed_images[0][1], config=math_config)
            additional_symbols = re.findall(math_symbols_pattern, math_text)
            all_symbols.update(additional_symbols)
        except Exception as e:
            logger.warning(f"Math-specific OCR failed: {str(e)}")
        
        # Convert set to list for return
        result = list(all_symbols)
        logger.info(f"Extracted {len(result)} unique mathematical symbols")
        return result

    except Exception as e:
        logger.error(f"Error in mathematical symbol extraction: {str(e)}")
        logger.error(traceback.format_exc())
        return []