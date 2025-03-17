from PIL import Image
import numpy as np

import io
import os

def analyze_image_quality(image_path):
    """Analyzes comprehensive image quality metrics"""
    image = cv2.imread(image_path)
    height, width = image.shape[:2]
    
    # Basic metrics
    blur_score = calculate_blur(image)
    contrast_score = calculate_contrast(image)
    brightness_score = calculate_brightness(image)
    noise_level = calculate_noise(image)
    sharpness = calculate_sharpness(image)
    
    # Color analysis
    color_metrics = analyze_color_distribution(image)
    
    # Edge and detail analysis
    edge_density = calculate_edge_density(image)
    detail_score = calculate_detail_score(image)
    
    quality_score = calculate_quality_score(
        blur_score, contrast_score, brightness_score, 
        noise_level, sharpness, edge_density
    )
    
    return {
        'basic_metrics': {
            'resolution': f"{width}x{height}",
            'aspect_ratio': f"{width/height:.2f}",
            'file_size_mb': round(os.path.getsize(image_path) / (1024 * 1024), 2),
            'dimensions': {
                'width': width,
                'height': height,
                'megapixels': (width * height) / 1000000
            }
        },
        'quality_scores': {
            'overall_quality': quality_score,
            'blur_score': round(blur_score, 2),
            'contrast_score': round(contrast_score, 2),
            'brightness_score': round(brightness_score, 2),
            'noise_level': round(noise_level, 2),
            'sharpness': round(sharpness, 2),
            'edge_density': round(edge_density, 2),
            'detail_score': round(detail_score, 2)
        },
        'color_analysis': color_metrics
    }

def calculate_quality_score(blur, contrast, brightness, noise, sharpness, edge_density):
    """Calculate comprehensive quality score"""
    weights = {
        'blur': 0.25,
        'contrast': 0.2,
        'brightness': 0.15,
        'noise': 0.15,
        'sharpness': 0.15,
        'edge_density': 0.1
    }
    
    # Normalize all scores to 0-100 range
    normalized_scores = {
        'blur': min(100, max(0, blur / 100)),
        'contrast': min(100, max(0, contrast)),
        'brightness': min(100, max(0, brightness)),
        'noise': 100 - min(100, max(0, noise * 10)),  # Inverse noise score
        'sharpness': min(100, max(0, sharpness)),
        'edge_density': min(100, max(0, edge_density * 100))
    }
    
    # Calculate weighted score
    final_score = sum(
        normalized_scores[metric] * weight 
        for metric, weight in weights.items()
    )
    
    return round(final_score)

def calculate_blur(image):
    """Enhanced blur detection using multiple methods"""
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Laplacian variance method
    laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
    
    # FFT method for blur detection
    rows, cols = gray.shape
    crow, ccol = rows//2, cols//2
    f = np.fft.fft2(gray)
    fshift = np.fft.fftshift(f)
    fft_blur = 20 * np.log(np.abs(fshift))
    
    return (laplacian_var + np.mean(fft_blur)) / 2

def calculate_contrast(image):
    """Calculate image contrast using multiple methods"""
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Standard deviation method
    std_contrast = gray.std()
    
    # RMS contrast
    rms_contrast = np.sqrt(np.mean(np.square(gray - np.mean(gray))))
    
    return (std_contrast + rms_contrast) / 2

def calculate_brightness(image):
    """Calculate image brightness using multiple channels"""
    # Convert to HSV for better brightness calculation
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    return np.mean(hsv[:, :, 2])

def calculate_noise(image):
    """Estimate image noise level"""
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Calculate noise using mean of Gaussian derivatives
    noise_sigma = np.mean([
        np.std(cv2.GaussianBlur(gray, (3,3), s) - gray)
        for s in [1.0, 2.0, 3.0]
    ])
    
    return noise_sigma

def calculate_sharpness(image):
    """Calculate image sharpness"""
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Sobel derivatives
    dx = cv2.Sobel(gray, cv2.CV_64F, 1, 0)
    dy = cv2.Sobel(gray, cv2.CV_64F, 0, 1)
    
    return np.mean(np.sqrt(dx*dx + dy*dy))

def calculate_edge_density(image):
    """Calculate edge density in the image"""
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, 100, 200)
    return np.mean(edges > 0)

def calculate_detail_score(image):
    """Calculate detail preservation score"""
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Multi-scale detail analysis
    detail_scores = []
    for scale in [0.5, 1.0, 2.0]:
        scaled = cv2.resize(gray, None, fx=scale, fy=scale)
        detail_scores.append(np.std(scaled))
    
    return np.mean(detail_scores)

def analyze_color_distribution(image):
    """Analyze color distribution and characteristics"""
    # Convert to different color spaces
    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
    
    # Calculate color metrics
    color_metrics = {
        'color_distribution': {
            'mean_rgb': image.mean(axis=(0,1)).tolist(),
            'std_rgb': image.std(axis=(0,1)).tolist(),
            'mean_hsv': hsv.mean(axis=(0,1)).tolist(),
            'mean_lab': lab.mean(axis=(0,1)).tolist()
        },
        'color_stats': {
            'saturation': np.mean(hsv[:,:,1]),
            'value_variance': np.var(hsv[:,:,2]),
            'dominant_colors': get_dominant_colors(image),
            'color_contrast': calculate_color_contrast(image)
        }
    }
    
    return color_metrics

def get_dominant_colors(image, n_colors=3):
    """Extract dominant colors using k-means clustering"""
    pixels = image.reshape(-1, 3)
    pixels = np.float32(pixels)
    
    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 200, 0.1)
    _, labels, centers = cv2.kmeans(pixels, n_colors, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS)
    
    centers = np.uint8(centers)
    return centers.tolist()

def calculate_color_contrast(image):
    """Calculate contrast between different color channels"""
    b, g, r = cv2.split(image)
    return {
        'rg_contrast': np.abs(np.mean(r) - np.mean(g)),
        'rb_contrast': np.abs(np.mean(r) - np.mean(b)),
        'gb_contrast': np.abs(np.mean(g) - np.mean(b))
    }

