# image-analysis-service/src/utils/preprocessor.py
import cv2
import numpy as np
import logging
import os
import traceback

logger = logging.getLogger(__name__)

def preprocess_image(image_path, methods=None):
    """
    Preprocess an image before sending it to the analysis pipeline.
    Returns the path to the preprocessed image.
    
    :param image_path: Path to the input image
    :param methods: List of preprocessing methods to apply (or None for default)
    :return: Path to preprocessed image
    """
    try:
        # Read the image
        image = cv2.imread(image_path)
        if image is None:
            logger.error(f"Failed to read image at {image_path}")
            return image_path  # Return original if we can't process
        
        # Default preprocessing methods if none specified
        if methods is None:
            methods = ['denoise', 'enhance_contrast', 'auto_straighten']
        
        # Apply preprocessing methods
        enhanced_image = image.copy()
        
        # Apply selected methods
        for method in methods:
            if method == 'denoise':
                enhanced_image = apply_denoising(enhanced_image)
            elif method == 'enhance_contrast':
                enhanced_image = apply_contrast_enhancement(enhanced_image)
            elif method == 'sharpen':
                enhanced_image = apply_sharpening(enhanced_image)
            elif method == 'auto_straighten':
                enhanced_image = apply_auto_straightening(enhanced_image)
            elif method == 'clean_background':
                enhanced_image = apply_background_cleaning(enhanced_image)
            # Add other methods as needed
        
        # Save the preprocessed image with a different filename
        output_path = image_path.replace('.', '_preprocessed.')
        cv2.imwrite(output_path, enhanced_image)
        
        return output_path
    
    except Exception as e:
        logger.error(f"Error in image preprocessing: {str(e)}")
        logger.error(traceback.format_exc())
        return image_path  # Return original if preprocessing fails

def apply_denoising(image):
    """Apply denoising to reduce noise while preserving edges"""
    try:
        # Check if image is grayscale or color
        if len(image.shape) == 2 or image.shape[2] == 1:
            # For grayscale images
            denoised = cv2.fastNlMeansDenoising(image, None, 7, 7, 21)
        else:
            # For color images - use Non-local Means Denoising
            denoised = cv2.fastNlMeansDenoisingColored(image, None, 7, 7, 7, 21)
        
        logger.info("Applied denoising")
        return denoised
    
    except Exception as e:
        logger.warning(f"Error applying denoising: {str(e)}")
        return image  # Return original if denoising fails

def apply_contrast_enhancement(image):
    """Apply contrast enhancement to improve visibility"""
    try:
        # Convert to LAB color space for better contrast enhancement
        if len(image.shape) > 2:
            lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
            l, a, b = cv2.split(lab)
            
            # Apply CLAHE to L channel
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
            cl = clahe.apply(l)
            
            # Merge channels back and convert to BGR
            enhanced_lab = cv2.merge((cl, a, b))
            enhanced_img = cv2.cvtColor(enhanced_lab, cv2.COLOR_LAB2BGR)
        else:
            # For grayscale images
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
            enhanced_img = clahe.apply(image)
        
        logger.info("Applied contrast enhancement")
        return enhanced_img
    
    except Exception as e:
        logger.warning(f"Error applying contrast enhancement: {str(e)}")
        return image  # Return original if enhancement fails

def apply_sharpening(image):
    """Apply sharpening to enhance edges and text"""
    try:
        # Create a sharpening kernel
        kernel = np.array([[-1, -1, -1],
                           [-1,  9, -1],
                           [-1, -1, -1]])
        
        # Apply the kernel
        sharpened = cv2.filter2D(image, -1, kernel)
        
        logger.info("Applied sharpening")
        return sharpened
    
    except Exception as e:
        logger.warning(f"Error applying sharpening: {str(e)}")
        return image  # Return original if sharpening fails

def apply_auto_straightening(image):
    """Detect and correct skewed diagrams"""
    try:
        # Convert to grayscale if necessary
        if len(image.shape) > 2:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image.copy()
        
        # Detect edges
        edges = cv2.Canny(gray, 50, 150, apertureSize=3)
        
        # Find lines using Hough Transform
        lines = cv2.HoughLines(edges, 1, np.pi/180, threshold=100)
        
        if lines is None or len(lines) == 0:
            logger.info("No lines detected for auto-straightening")
            return image
        
        # Calculate the average angle of horizontal lines
        angles = []
        for line in lines:
            rho, theta = line[0]
            # Convert to degrees
            angle_deg = np.degrees(theta)
            
            # Check if it's close to horizontal (0 or 180 degrees)
            if angle_deg < 45 or angle_deg > 135:
                deviation = min(angle_deg, 180 - angle_deg)
                angles.append(deviation)
        
        if not angles:
            logger.info("No horizontal lines found for straightening")
            return image
        
        # Calculate average deviation
        avg_deviation = np.mean(angles)
        
        # Only straighten if deviation is significant
        if avg_deviation < 2.0:
            logger.info(f"Image is already straight (deviation: {avg_deviation:.2f}°)")
            return image
        
        # Determine rotation angle
        rotation_angle = avg_deviation if avg_deviation < 45 else -avg_deviation
        
        # Get image center and rotation matrix
        height, width = image.shape[:2]
        center = (width/2, height/2)
        rotation_matrix = cv2.getRotationMatrix2D(center, rotation_angle, 1.0)
        
        # Perform rotation
        rotated_image = cv2.warpAffine(image, rotation_matrix, (width, height), 
                                       flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, 
                                       borderValue=(255, 255, 255))
        
        logger.info(f"Applied auto-straightening (angle: {rotation_angle:.2f}°)")
        return rotated_image
    
    except Exception as e:
        logger.warning(f"Error applying auto-straightening: {str(e)}")
        return image  # Return original if straightening fails

def apply_background_cleaning(image):
    """Clean up the background to improve clarity of diagram elements"""
    try:
        # Convert to grayscale if necessary
        if len(image.shape) > 2:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        else:
            gray = image.copy()
        
        # Apply adaptive thresholding
        thresh = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                                    cv2.THRESH_BINARY, 11, 2)
        
        # Clean up with morphological operations
        kernel = np.ones((2, 2), np.uint8)
        cleaned = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
        
        # If original was color, apply the mask
        if len(image.shape) > 2:
            # Create a 3-channel binary mask
            mask = cv2.cvtColor(cleaned, cv2.COLOR_GRAY2BGR)
            mask = (mask == 255)
            
            # Apply mask to original
            result = image.copy()
            result = np.where(mask, result, 255)  # Set background to white
        else:
            result = cleaned
        
        logger.info("Applied background cleaning")
        return result
    
    except Exception as e:
        logger.warning(f"Error applying background cleaning: {str(e)}")
        return image  # Return original if cleaning fails