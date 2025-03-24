import os
from flask import Flask, request, jsonify
import cv2
import pytesseract
import numpy as np
from PIL import Image
import io

app = Flask(__name__)

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff'}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def detect_text_in_image(image_path):
    """
    Detects text in an image using OCR.
    Returns tuple of (text_found, text_content)
    """
    try:
        # Read image with OpenCV
        img = cv2.imread(image_path)
        if img is None:
            return False, "Error: Unable to read image file"
        
        # Preprocess the image to improve OCR results
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        blur = cv2.GaussianBlur(gray, (5, 5), 0)
        _, threshold = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        # Perform OCR
        text = pytesseract.image_to_string(threshold)
        
        # Clean and check the text
        text = text.strip()
        
        # If there's no text or only whitespace/special chars
        if not text or text.isspace():
            return False, ""
            
        return True, text
    except Exception as e:
        # Log the exception but don't fail
        print(f"Error processing image: {str(e)}")
        return False, f"Error: {str(e)}"

@app.route('/check-image-text', methods=['POST'])
def check_image_text():
    """
    API endpoint to check if an image contains text.
    """
    # Check if request has the file part
    if 'image' not in request.files:
        return jsonify({
            'success': False,
            'error': 'No image file in request',
            'contains_text': None
        }), 400
    
    file = request.files['image']
    
    # Check if file is empty
    if file.filename == '':
        return jsonify({
            'success': False,
            'error': 'No file selected',
            'contains_text': None
        }), 400
    
    # Check if the file is allowed
    if not allowed_file(file.filename):
        return jsonify({
            'success': False,
            'error': f'File type not allowed. Supported types: {", ".join(ALLOWED_EXTENSIONS)}',
            'contains_text': None
        }), 400
    
    try:
        # Save the file temporarily
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(filepath)
        
        # Process the image
        has_text, text_content = detect_text_in_image(filepath)
        
        # Clean up the file
        os.remove(filepath)
        
        # Return the result
        return jsonify({
            'success': True,
            'contains_text': has_text,
            'text_content': text_content if has_text else None
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Error processing image: {str(e)}',
            'contains_text': None
        }), 500

@app.route('/process-image', methods=['POST'])
def process_image():
    """
    API endpoint to process images and handle those without text gracefully.
    """
    # Check if request has the file part
    if 'image' not in request.files:
        return jsonify({
            'success': False,
            'error': 'No image file in request',
            'processed': False
        }), 400
    
    file = request.files['image']
    
    # Check if file is empty
    if file.filename == '':
        return jsonify({
            'success': False,
            'error': 'No file selected',
            'processed': False
        }), 400
    
    # Check if the file is allowed
    if not allowed_file(file.filename):
        return jsonify({
            'success': False,
            'error': f'File type not allowed. Supported types: {", ".join(ALLOWED_EXTENSIONS)}',
            'processed': False
        }), 400
    
    try:
        # Save the file temporarily
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(filepath)
        
        # Process the image
        has_text, text_content = detect_text_in_image(filepath)
        
        # Example of handling both cases properly
        if has_text:
            result = {
                'success': True,
                'processed': True,
                'contains_text': True,
                'text_content': text_content,
                'action_taken': 'Text extracted successfully'
            }
        else:
            # No text found, but this is not an error - handle gracefully
            result = {
                'success': True,
                'processed': True,
                'contains_text': False,
                'action_taken': 'Image processed but no text was found'
            }
        
        # Clean up the file
        os.remove(filepath)
        
        # Return the appropriate result
        return jsonify(result)
        
    except Exception as e:
        # Log the exception
        print(f"Error in process_image: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Error processing image: {str(e)}',
            'processed': False
        }), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Simple health check endpoint."""
    return jsonify({'status': 'healthy'})

if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=5000)