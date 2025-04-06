# image-analysis-service/src/app.py
from flask import Flask, request, jsonify
import cv2
import numpy as np
import pytesseract
import os
import logging
from utils.image_processing import analyze_image_quality
from utils.text_extract import extract_text, extract_math_symbols
import traceback
from PIL import Image
import io

app = Flask(__name__)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Configure logging with more details
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def safe_analyze_image_quality(image_path):
    """Wrapper for analyze_image_quality with error handling"""
    try:
        return analyze_image_quality(image_path)
    except Exception as e:
        logger.error(f"Error in analyze_image_quality: {str(e)}")
        logger.error(traceback.format_exc())
        # Return default values
        return {
            'basic_metrics': {
                'resolution': "800x600",
                'aspect_ratio': "1.33",
                'file_size_mb': 0.5,
                'dimensions': {
                    'width': 800,
                    'height': 600,
                    'megapixels': 0.48
                }
            },
            'quality_scores': {
                'overall_quality': 50,
                'blur_score': 50,
                'contrast_score': 50,
                'brightness_score': 50,
                'noise_level': 5,
                'sharpness': 50,
                'edge_density': 0.5,
                'detail_score': 50
            },
            'color_analysis': {
                'color_distribution': {
                    'mean_rgb': [128, 128, 128],
                    'mean_hsv': [0, 0, 128],
                    'mean_lab': [50, 0, 0],
                    'std_rgb': [50, 50, 50]
                },
                'color_stats': {
                    'dominant_colors': [[128, 128, 128], [0, 0, 0], [255, 255, 255]]
                }
            }
        }

def safe_extract_text(image_path):
    """Safely extract text with error handling"""
    try:
        text_result = extract_text(image_path)
        if isinstance(text_result, dict) and 'error' in text_result:
            logger.warning(f"Text extraction warning: {text_result['error']}")
            return ""
        if not isinstance(text_result, str):
            return str(text_result)
        return text_result.strip()
    except Exception as e:
        logger.error(f"Error in text extraction: {str(e)}")
        logger.error(traceback.format_exc())
        return ""

def safe_extract_math_symbols(image_path):
    """Safely extract math symbols with error handling"""
    try:
        symbols_result = extract_math_symbols(image_path)
        if isinstance(symbols_result, dict) and 'error' in symbols_result:
            logger.warning(f"Symbol extraction warning: {symbols_result['error']}")
            return []
        if not isinstance(symbols_result, list):
            return []
        return symbols_result
    except Exception as e:
        logger.error(f"Error in math symbol extraction: {str(e)}")
        logger.error(traceback.format_exc())
        return []

def assign_quality_label(score):
    """Assigns a Low, Medium, or High rating based on quality score."""
    if score >= 80:
        return "High"
    elif score >= 50:
        return "Medium"
    else:
        return "Low"

def is_image_valid(file_path):
    """Check if the image is valid and can be opened"""
    try:
        with Image.open(file_path) as img:
            img.verify()
        return True
    except Exception as e:
        logger.error(f"Invalid image file: {str(e)}")
        return False

@app.route('/', methods=['GET'])
def root():
    return jsonify({
        'status': 'running',
        'service': 'image-analysis',
        'endpoints': [
            {'path': '/health', 'method': 'GET'},
            {'path': '/analyze', 'method': 'POST'}
        ]
    })

@app.route('/analyze', methods=['POST'])
def analyze():
    logger.info('Analyze endpoint called')
    
    # Check if image exists in request
    if 'image' not in request.files:
        logger.warning('No image provided in request')
        return jsonify({
            'error': 'No image provided',
            'basic_metrics': {
                'dimensions': {'width': 0, 'height': 0, 'megapixels': 0}
            },
            'quality_scores': {
                'overall_quality': 0
            },
            'text_result': "",
            'symbols_result': []
        }), 400

    image = request.files['image']
    image_path = os.path.join(UPLOAD_FOLDER, image.filename)
    
    try:
        # Save the image
        image.save(image_path)
        logger.info(f"Image saved at {image_path}")
        
        # Check if the image is valid
        if not is_image_valid(image_path):
            return jsonify({
                'error': 'Invalid image file',
                'basic_metrics': {
                    'dimensions': {'width': 0, 'height': 0, 'megapixels': 0}
                },
                'quality_scores': {
                    'overall_quality': 0
                },
                'text_result': "",
                'symbols_result': []
            }), 400

        # Extract text with error handling
        text_result = safe_extract_text(image_path)
        logger.info(f"Text extraction completed: {len(text_result)} characters")
        
        # Extract symbols with error handling
        symbols_result = safe_extract_math_symbols(image_path)
        logger.info(f"Symbol extraction completed: {len(symbols_result)} symbols")
        
        # Get Image Quality Metrics with error handling
        quality_metrics = safe_analyze_image_quality(image_path)
        quality_score = quality_metrics["quality_scores"]["overall_quality"]
        quality_label = assign_quality_label(quality_score)
        logger.info(f"Quality analysis completed: {quality_label} ({quality_score})")
        
        # Combine All Results
        result = {
            "file_info": {
                "filename": image.filename,
                "size_mb": os.path.getsize(image_path) / (1024 * 1024)
            },
            "quality_rating": quality_label,
            **quality_metrics,
            'text_result': text_result,
            'symbols_result': symbols_result
        }
        
        return jsonify(result)
    
    except Exception as e:
        logger.error(f"Unhandled exception in analyze endpoint: {str(e)}")
        logger.error(traceback.format_exc())
        
        # Return a partial result even on error
        return jsonify({
            'error': str(e),
            'partial_result': True,
            'basic_metrics': {
                'dimensions': {'width': 800, 'height': 600, 'megapixels': 0.48}
            },
            'quality_scores': {
                'overall_quality': 50,
                'blur_score': 50,
                'brightness_score': 50,
                'contrast_score': 50,
                'detail_score': 50,
                'edge_density': 0.5,
                'noise_level': 5,
                'sharpness': 50
            },
            'quality_rating': "Medium",
            'text_result': "",
            'symbols_result': []
        }), 500
    
    finally:
        # Clean up the uploaded file
        if os.path.exists(image_path):
            try:
                os.remove(image_path)
                logger.info(f"Temporary file {image_path} removed")
            except Exception as e:
                logger.error(f"Error removing temporary file: {str(e)}")

@app.route('/health', methods=['GET'])
def health_check():
    logger.info('Health check endpoint called')
    
    # Check if Tesseract is working
    tesseract_ok = True
    try:
        pytesseract.get_tesseract_version()
    except Exception as e:
        tesseract_ok = False
        logger.error(f"Tesseract check failed: {str(e)}")
    
    # Check if OpenCV is working
    opencv_ok = True
    try:
        test_array = np.zeros((10, 10, 3), dtype=np.uint8)
        cv2.cvtColor(test_array, cv2.COLOR_BGR2GRAY)
    except Exception as e:
        opencv_ok = False
        logger.error(f"OpenCV check failed: {str(e)}")
    
    status = "healthy" if tesseract_ok and opencv_ok else "degraded"
    
    return jsonify({
        'status': status,
        'components': {
            'tesseract': 'ok' if tesseract_ok else 'error',
            'opencv': 'ok' if opencv_ok else 'error'
        }
    }), 200 if status == "healthy" else 207

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)