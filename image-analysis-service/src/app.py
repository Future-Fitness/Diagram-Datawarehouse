from flask import Flask, request, jsonify
import cv2
import numpy as np
import pytesseract
import os
from utils.image_processing import analyze_image_quality
import logging
from utils.text_extract import extract_text, extract_math_symbols
import cv2

app = Flask(__name__)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Configure logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

def analyze_diagram(image_path):
    """Comprehensive diagram analysis"""
    image = cv2.imread(image_path)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 50, 150)
    contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

    # Shape analysis
    shape_counts = {"circles": 0, "rectangles": 0, "lines": 0}
    vertical_bars = 0
    horizontal_bars = 0

    for cnt in contours:
        approx = cv2.approxPolyDP(cnt, 0.02 * cv2.arcLength(cnt, True), True)
        x, y, w, h = cv2.boundingRect(cnt)
        
        if len(approx) > 8:  # Circle detection
            shape_counts["circles"] += 1
        elif len(approx) == 4:  # Rectangle detection
            shape_counts["rectangles"] += 1
            if h > w * 2:  # Vertical bar
                vertical_bars += 1
            elif w > h * 2:  # Horizontal bar
                horizontal_bars += 1
        elif len(approx) == 2:  # Line detection
            shape_counts["lines"] += 1

    # Chart type detection
    circles = cv2.HoughCircles(gray, cv2.HOUGH_GRADIENT, 1, 20,
                              param1=50, param2=30, minRadius=50, maxRadius=300)

    # Text extraction with confidence
    text_data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT)
    text_blocks = [{"text": text_data['text'][i], "confidence": int(text_data['conf'][i])}
                   for i in range(len(text_data['text'])) if int(text_data['conf'][i]) > 60]

    # Determine chart type
    chart_analysis = {
        "type": "Unknown",
        "characteristics": {
            "is_pie_chart": circles is not None,
            "is_bar_chart": (vertical_bars + horizontal_bars) > 2,
            "vertical_bars": vertical_bars,
            "horizontal_bars": horizontal_bars
        }
    }

    if chart_analysis["characteristics"]["is_pie_chart"]:
        chart_analysis["type"] = "Pie Chart"
    elif chart_analysis["characteristics"]["is_bar_chart"]:
        chart_analysis["type"] = "Bar Chart"

    # Get color analysis
    colors = extract_colors(image)

    return {
        "shapes_detected": shape_counts,
        "chart_analysis": chart_analysis,
        "text_analysis": {
            "blocks": text_blocks,
            "total_words": len([block for block in text_blocks if block['text'].strip()]),
            "average_confidence": np.mean([block['confidence'] for block in text_blocks if block['text'].strip()])
        },
        "color_analysis": colors,
        "grid_detection": detect_grid_lines(image_path)
    }

def extract_colors(image, k=3):
    """Extract dominant colors using k-means clustering"""
    pixels = image.reshape(-1, 3)
    pixels = np.float32(pixels)
    
    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 200, 0.1)
    _, _, centers = cv2.kmeans(pixels, k, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS)
    
    return np.uint8(centers).tolist()

def detect_grid_lines(image_path):
    """Detect if the image contains grid lines"""
    image = cv2.imread(image_path, 0)
    edges = cv2.Canny(image, 50, 150, apertureSize=3)
    
    lines = cv2.HoughLines(edges, 1, np.pi/180, 200)
    return lines is not None

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


def assign_quality_label(score):
    """Assigns a Low, Medium, or High rating based on quality score."""
    if score >= 80:
        return "High"
    elif score >= 50:
        return "Medium"
    else:
        return "Low"
    

@app.route('/analyze', methods=['POST'])
def analyze():
    logger.info('Analyze endpoint called')
    if 'image' not in request.files:
        return jsonify({'error': 'No image provided'}), 400

    image = request.files['image']
    image_path = os.path.join(UPLOAD_FOLDER, image.filename)
    image.save(image_path)

    try:
        try:
            text_result = extract_text(image_path)
            if not isinstance(text_result, str):
                text_result = str(text_result)
            if not text_result.strip():
                text_result = ""
        except Exception:
            text_result = ""

        try:
            symbols_result = extract_math_symbols(image_path)
            if not isinstance(symbols_result, str):
                symbols_result = str(symbols_result)
            if not symbols_result.strip():
                symbols_result = ""
        except Exception:
            symbols_result = ""

    # Now text_result and symbols_result are safe to send to backend
        

        # Get Image Quality Metrics
        quality_metrics = analyze_image_quality(image_path)
        quality_score = quality_metrics["quality_scores"]["overall_quality"]
        quality_label = assign_quality_label(quality_score)

        text_result = extract_text(image_path)
        symbols_result = extract_math_symbols(image_path)

        # Combine All Results
        result = {
            "file_info": {
                "filename": image.filename,
                "size_mb": os.path.getsize(image_path) / (1024 * 1024)
            },
            "quality_rating": quality_label,
            **quality_metrics,
            'text_result':text_result,
            'symbols_result':symbols_result

        }
        
        return jsonify(result)
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if os.path.exists(image_path):
            os.remove(image_path)

            
@app.route('/health', methods=['GET'])
def health_check():
    logger.info('Health check endpoint called')
    return jsonify({'status': 'healthy'}), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001) 