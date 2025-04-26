# image-analysis-service/src/utils/diagram_ocr.py
import cv2
import pytesseract
import numpy as np
import logging
import traceback
from PIL import Image
import re

logger = logging.getLogger(__name__)

def enhance_for_ocr(image):
    """Create diagram-optimized image variants for better OCR results"""
    results = []
    
    # Basic grayscale conversion
    if len(image.shape) > 2:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    else:
        gray = image.copy()
    
    # 1. Binarization with Otsu's method - good for clear diagrams
    _, binary_otsu = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    results.append(("binary_otsu", binary_otsu))
    
    # 2. Adaptive thresholding - better for varying lighting
    binary_adaptive = cv2.adaptiveThreshold(
        gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
        cv2.THRESH_BINARY, 11, 2
    )
    results.append(("adaptive", binary_adaptive))
    
    # 3. Contrast enhancement (CLAHE)
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    enhanced = clahe.apply(gray)
    results.append(("clahe", enhanced))
    
    # 4. Noise reduction with edge preservation
    denoised = cv2.fastNlMeansDenoising(gray, None, 10, 7, 21)
    _, denoised_binary = cv2.threshold(denoised, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    results.append(("denoised", denoised_binary))
    
    # 5. Special handling for diagrams with small text
    # Scale up, then apply thresholding
    h, w = gray.shape
    scaled = cv2.resize(gray, (w*2, h*2), interpolation=cv2.INTER_CUBIC)
    _, scaled_binary = cv2.threshold(scaled, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    results.append(("scaled", scaled_binary))
    
    return results

def extract_diagram_text(image_path):
    """
    Extracts text from diagrams using specialized processing techniques
    
    Args:
        image_path: Path to the image file
        
    Returns:
        Extracted text as string
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
                return ""
        
        # Create enhanced versions for OCR
        enhanced_versions = enhance_for_ocr(image)
        
        # OCR configurations optimized for diagrams
        configs = [
            '--psm 6',  # Assume a single block of text
            '--psm 3',  # Fully automatic page segmentation
            '--psm 11 --oem 3',  # Sparse text. No OSD.
        ]
        
        # Try all combinations and score results
        results = []
        
        for version_name, img in enhanced_versions:
            for config in configs:
                try:
                    # Extract text with confidence data
                    ocr_data = pytesseract.image_to_data(img, config=config, output_type=pytesseract.Output.DICT)
                    
                    # Get the text
                    text = pytesseract.image_to_string(img, config=config)
                    text = text.strip()
                    
                    # Skip empty results
                    if not text:
                        continue
                    
                    # Calculate confidence
                    confidences = [conf for conf in ocr_data['conf'] if conf != -1]
                    avg_confidence = np.mean(confidences) if confidences else 0
                    
                    # Count actual content
                    text_length = len(text.replace(" ", "").replace("\n", ""))
                    word_count = len([w for w in text.split() if w.strip()])
                    
                    # Calculate score (weighted for diagrams)
                    # Diagrams often have short labels, so we don't penalize as much for short text
                    score = avg_confidence * (0.5 + min(text_length / 300, 1.5))
                    
                    # Boost score for short words (likely diagram labels)
                    short_words = len([w for w in text.split() if 1 < len(w) <= 4])
                    if short_words > 0 and short_words / max(1, word_count) > 0.3:
                        score *= 1.2
                    
                    logger.debug(f"Method {version_name}, config {config}: score={score:.2f}, words={word_count}")
                    
                    # Add to results
                    results.append({
                        'text': text,
                        'score': score,
                        'config': config,
                        'method': version_name
                    })
                
                except Exception as e:
                    logger.debug(f"OCR failed for method {version_name}, config {config}: {str(e)}")
        
        # Return the best result
        if results:
            # Sort by score
            results.sort(key=lambda x: x['score'], reverse=True)
            best = results[0]
            logger.info(f"Best OCR result: method={best['method']}, config={best['config']}, score={best['score']:.2f}")
            return best['text']
        
        return ""
    
    except Exception as e:
        logger.error(f"Error in diagram text extraction: {str(e)}")
        logger.error(traceback.format_exc())
        return ""

def extract_math_symbols(image_path):
    """
    Extract mathematical symbols and expressions from diagrams
    
    Args:
        image_path: Path to the image file
        
    Returns:
        List of detected mathematical symbols
    """
    try:
        # Read the image
        image = cv2.imread(image_path)
        if image is None:
            return []
        
        # Create enhanced versions
        enhanced_versions = enhance_for_ocr(image)
        
        # Define patterns for mathematical symbols
        math_pattern = r'[+\-*/=≠<>≤≥≈±∓×÷∞∂∫∬∭∮∇∆√∛∜∑∏π]'
        
        all_symbols = set()
        
        # Try math-specific configurations
        math_configs = [
            '--psm 6 --oem 3 -c tessedit_char_whitelist=0123456789+-*/()=<>≤≥∞∫∑√π{}[]^',
            '--psm 11 --oem 3', # Sparse text mode better for isolated symbols
        ]
        
        # Process each enhanced version
        for _, img in enhanced_versions:
            for config in math_configs:
                try:
                    text = pytesseract.image_to_string(img, config=config)
                    
                    # Find math symbols
                    symbols = re.findall(math_pattern, text)
                    all_symbols.update(symbols)
                    
                    # Also check for specific notations (custom parsing for math expressions)
                    if '=' in text:
                        equation_parts = text.split('=')
                        for part in equation_parts:
                            if re.search(r'[a-zA-Z]', part) and re.search(r'[0-9]', part):
                                # This might be a variable assignment or equation
                                all_symbols.add('=')
                    
                    # Check for fractions (/ with numbers)
                    fractions = re.findall(r'[0-9]+/[0-9]+', text)
                    if fractions:
                        all_symbols.add('/')
                    
                    # Check for exponents (superscripts)
                    exponents = re.findall(r'[a-zA-Z]\^[0-9]', text)
                    if exponents:
                        all_symbols.add('^')
                        
                except Exception as e:
                    logger.debug(f"Math extraction error with config {config}: {str(e)}")
        
        return list(all_symbols)
        
    except Exception as e:
        logger.error(f"Error in math symbol extraction: {str(e)}")
        return []