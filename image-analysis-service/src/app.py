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
import uuid

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
    # Special handling for SVG files
    if image_path.lower().endswith('.svg'):
        logger.info(f"SVG file detected: {image_path}. Using default quality values.")
        # Return default quality values for SVG files since they're vector graphics
        return {
            'basic_metrics': {
                'resolution': "Vector",
                'aspect_ratio': "1.0",
                'file_size_mb': os.path.getsize(image_path) / (1024 * 1024),
                'dimensions': {
                    'width': 800,  # Default display width
                    'height': 600,  # Default display height
                    'megapixels': 0  # SVGs don't have pixels
                }
            },
            'quality_scores': {
                'overall_quality': 90,  # Vector graphics are typically high quality
                'blur_score': 100,
                'contrast_score': 85,
                'brightness_score': 85,
                'noise_level': 0,
                'sharpness': 100,
                'edge_density': 0.7,
                'detail_score': 90
            },
            'color_analysis': {
                'color_distribution': {
                    'mean_rgb': [128, 128, 128],
                    'mean_hsv': [0, 0, 128],
                    'mean_lab': [50, 0, 0],
                    'std_rgb': [50, 50, 50]
                },
                'color_stats': {
                    'dominant_colors': [[0, 0, 0], [255, 255, 255], [128, 128, 128]]
                }
            }
        }
    
    # Original implementation for raster images
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
                'file_size_mb': os.path.getsize(image_path) / (1024 * 1024),
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
    # Special handling for SVG files
    if image_path.lower().endswith('.svg'):
        try:
            # For SVG files, we can try to extract text directly from the XML
            with open(image_path, 'r', encoding='utf-8') as f:
                svg_content = f.read()
            
            # Extract text elements from SVG (a very basic approach)
            import re
            text_elements = re.findall(r'<text[^>]*>(.*?)</text>', svg_content, re.DOTALL)
            
            # Combine and clean text elements
            extracted_text = ' '.join(text_elements)
            extracted_text = re.sub(r'<[^>]+>', ' ', extracted_text)  # Remove any nested tags
            extracted_text = re.sub(r'\s+', ' ', extracted_text).strip()  # Clean whitespace
            
            logger.info(f"Extracted {len(extracted_text)} characters from SVG text elements")
            return extracted_text
        except Exception as e:
            logger.error(f"Error extracting text from SVG: {str(e)}")
            logger.error(traceback.format_exc())
            return ""
    try:
        text_result = extract_text(image_path)
            # Make sure we're returning a string
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
            # logger.warning(f"Symbol extraction warning: {symbols_result['error']}")
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
    # Special handling for SVG files
    if file_path.lower().endswith('.svg'):
        try:
            # For SVG files, we just check if the file exists and is not empty
            file_size = os.path.getsize(file_path)
            if file_size > 0:
                return True
            else:
                logger.error(f"SVG file exists but is empty: {file_path}")
                return False
        except Exception as e:
            logger.error(f"Error checking SVG file: {str(e)}")
            return False
    else:
        # For other image formats, use PIL
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
# image-analysis-service/src/app.py - Update the analyze endpoint
# update the analyze endpoint in image-analysis-service/src/app.py

@app.route('/analyze', methods=['POST'])
def analyze():
    logger.info('Analyze endpoint called')
    
    # Add detailed request debugging
    try:
        logger.debug(f"Request content type: {request.content_type}")
        logger.debug(f"Request has files: {len(request.files)}")
        if len(request.files) > 0:
            logger.debug(f"Files in request: {list(request.files.keys())}")
    except Exception as e:
        logger.error(f"Error inspecting request: {str(e)}")
    
    # Check if image exists in request
    if 'image' not in request.files:
        logger.warning('No image provided in request')
        return jsonify({
            'error': 'No image file found in request. Make sure to include a file with key "image".',
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
    
    # Check if filename is empty
    if image.filename == '':
        logger.warning('Empty filename in request')
        return jsonify({
            'error': 'Empty filename. Please provide a valid image file.',
            'basic_metrics': {
                'dimensions': {'width': 0, 'height': 0, 'megapixels': 0}
            },
            'quality_scores': {
                'overall_quality': 0
            },
            'text_result': "",
            'symbols_result': []
        }), 400
    
    # Log file information
    logger.info(f"Processing file: {image.filename}, Content type: {image.content_type}, Size: {image.content_length} bytes")
    
    # Create unique path to avoid collisions
    filename = f"{uuid.uuid4()}-{image.filename}"
    image_path = os.path.join(UPLOAD_FOLDER, filename)
    
    try:
        # Save the image
        image.save(image_path)
        logger.info(f"Image saved at {image_path}")
        
        # Check if the file is saved correctly
        if not os.path.exists(image_path):
            raise Exception("File was not saved correctly")
            
        # Check file size
        file_size = os.path.getsize(image_path)
        logger.debug(f"Saved file size: {file_size} bytes")
        if file_size == 0:
            raise Exception("File is empty (0 bytes)")
        
        # Check if the image is valid - this now handles SVG files specially
        is_svg = image_path.lower().endswith('.svg')
        if not is_image_valid(image_path):
            if is_svg:
                logger.warning(f"SVG file could not be validated, but will try to process anyway: {image_path}")
            else:
                return jsonify({
                    'error': 'Invalid image file. Could not be processed as an image.',
                    'basic_metrics': {
                        'dimensions': {'width': 0, 'height': 0, 'megapixels': 0}
                    },
                    'quality_scores': {
                        'overall_quality': 0
                    },
                    'text_result': "",
                    'symbols_result': []
                }), 400

        # Extract text with error handling - already handles SVG files specially
        try:
            text_result = safe_extract_text(image_path)
            logger.info(f"Text extraction completed: {len(text_result)} characters")
        except Exception as text_error:
            logger.error(f"Text extraction failed completely: {str(text_error)}")
            logger.error(traceback.format_exc())
            text_result = ""
        
        # Extract symbols - for SVG, this will likely return empty
        try:
            symbols_result = safe_extract_math_symbols(image_path)
            logger.info(f"Symbol extraction completed: {len(symbols_result)} symbols")
        except Exception as symbol_error:
            logger.error(f"Symbol extraction failed completely: {str(symbol_error)}")
            logger.error(traceback.format_exc())
            symbols_result = []
        
        # Get Image Quality Metrics - already handles SVG files specially
        try:
            quality_metrics = safe_analyze_image_quality(image_path)
            quality_score = quality_metrics["quality_scores"]["overall_quality"]
            quality_label = assign_quality_label(quality_score)
            logger.info(f"Quality analysis completed: {quality_label} ({quality_score})")
        except Exception as quality_error:
            logger.error(f"Quality analysis failed: {str(quality_error)}")
            logger.error(traceback.format_exc())
            # Default metrics
            quality_metrics = {
                'basic_metrics': {
                    'dimensions': {'width': 800, 'height': 600, 'megapixels': 0.48}
                },
                'quality_scores': {
                    'overall_quality': 50
                }
            }
            quality_label = "Medium"
        
        # Combine All Results
        result = {
            "file_info": {
                "filename": image.filename,
                "size_mb": os.path.getsize(image_path) / (1024 * 1024),
                "is_vector": is_svg
            },
            "quality_rating": quality_label,
            **quality_metrics,
            'text_result': text_result,
            'symbols_result': symbols_result
        }
        
        # Log successful analysis
        logger.info(f"Successfully analyzed image: {image.filename}")
        
        return jsonify(result)
    
    except Exception as e:
        logger.error(f"Unhandled exception in analyze endpoint: {str(e)}")
        logger.error(traceback.format_exc())
        
        # Return a partial result even on error
        is_svg = image_path.lower().endswith('.svg') if 'image_path' in locals() else False
        
        return jsonify({
            'error': str(e),
            'partial_result': True,
            'file_info': {
                'filename': image.filename if 'image' in locals() else 'unknown',
                'is_vector': is_svg
            },
            'basic_metrics': {
                'dimensions': {'width': 800, 'height': 600, 'megapixels': 0 if is_svg else 0.48}
            },
            'quality_scores': {
                'overall_quality': 90 if is_svg else 50,
                'blur_score': 100 if is_svg else 50,
                'brightness_score': 85 if is_svg else 50,
                'contrast_score': 85 if is_svg else 50,
                'detail_score': 90 if is_svg else 50,
                'edge_density': 0.7 if is_svg else 0.5,
                'noise_level': 0 if is_svg else 5,
                'sharpness': 100 if is_svg else 50
            },
            'quality_rating': "High" if is_svg else "Medium",
            'text_result': "",
            'symbols_result': []
        }), 500
    
    finally:
        # Clean up the uploaded file
        if 'image_path' in locals() and os.path.exists(image_path):
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