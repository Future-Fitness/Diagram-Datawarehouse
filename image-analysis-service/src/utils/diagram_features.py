# image-analysis-service/src/utils/diagram_features.py
import cv2
import numpy as np
import logging
import traceback
from enum import Enum
from dataclasses import dataclass
from typing import Dict, List, Any, Tuple, Optional

# Configure logging
logger = logging.getLogger(__name__)

class DiagramType(Enum):
    BAR_CHART = "bar_chart"
    LINE_GRAPH = "line_graph"
    SCATTER_PLOT = "scatter_plot"
    PIE_CHART = "pie_chart"
    FLOW_CHART = "flow_chart"
    NETWORK_DIAGRAM = "network_diagram"
    VENN_DIAGRAM = "venn_diagram"
    CHEMICAL_STRUCTURE = "chemical_structure"
    UNKNOWN = "unknown"

@dataclass
class DiagramFeatures:
    diagram_type: DiagramType
    type_confidence: float
    general_features: Dict[str, Any]
    specific_features: Dict[str, Any]
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert features to a dictionary for database storage"""
        return {
            "diagram_type": self.diagram_type.value,
            "type_confidence": self.type_confidence,
            "general_features": self.general_features,
            "specific_features": self.specific_features
        }

def extract_diagram_features(image_path: str) -> DiagramFeatures:
    """
    Extract features from a diagram image
    
    :param image_path: Path to the diagram image
    :return: DiagramFeatures object containing extracted features
    """
    try:
        logger.info(f"Extracting features from diagram: {image_path}")
        
        # Read the image
        image = cv2.imread(image_path)
        if image is None:
            logger.error(f"Failed to read image at {image_path}")
            raise ValueError(f"Unable to read image at {image_path}")
            
        # Extract general features (common to all diagram types)
        general_features = extract_general_features(image)
        
        # Classify diagram type
        diagram_type, confidence = classify_diagram_type(image)
        logger.info(f"Classified diagram as {diagram_type.value} with confidence {confidence:.2f}")
        
        # Extract type-specific features
        specific_features = extract_specific_features(image, diagram_type)
        
        return DiagramFeatures(
            diagram_type=diagram_type,
            type_confidence=confidence,
            general_features=general_features,
            specific_features=specific_features
        )
        
    except Exception as e:
        logger.error(f"Error extracting diagram features: {str(e)}")
        logger.error(traceback.format_exc())
        return DiagramFeatures(
            diagram_type=DiagramType.UNKNOWN,
            type_confidence=0.0,
            general_features={"error": str(e)},
            specific_features={}
        )

def extract_general_features(image: np.ndarray) -> Dict[str, Any]:
    """
    Extract general features common to all diagram types
    
    :param image: Image as numpy array
    :return: Dictionary of general features
    """
    features = {}
    
    # Image dimensions
    height, width, channels = image.shape
    features["dimensions"] = {
        "width": width,
        "height": height,
        "aspect_ratio": width / height
    }
    
    # Color information
    features["color_mode"] = "color" if channels == 3 else "grayscale"
    
    if channels == 3:
        # Convert to HSV for color analysis
        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
        
        # Calculate color histogram
        hist = cv2.calcHist([hsv], [0, 1], None, [36, 32], [0, 180, 0, 256])
        hist = cv2.normalize(hist, hist).flatten()
        
        # Determine dominant colors
        total_pixels = width * height
        color_count = np.sum(hist > 0.01)  # Count colors above 1% threshold
        
        features["color_count"] = int(color_count)
        features["is_colorful"] = color_count > 10  # Arbitrary threshold
    else:
        features["color_count"] = 0
        features["is_colorful"] = False
    
    # Detect if the image has a white/light background
    is_light_bg = has_light_background(image)
    features["has_light_background"] = is_light_bg
    
    # Edge complexity
    edges = cv2.Canny(cv2.cvtColor(image, cv2.COLOR_BGR2GRAY), 100, 200)
    edge_pixels = np.count_nonzero(edges)
    features["edge_density"] = edge_pixels / (width * height)
    
    # Text region estimation (rough approximation)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    _, text_mask = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    text_pixels = np.count_nonzero(text_mask)
    features["estimated_text_area"] = text_pixels / (width * height)
    
    return features

def classify_diagram_type(image: np.ndarray) -> Tuple[DiagramType, float]:
    """
    Classify the type of diagram based on visual features
    
    :param image: Image as numpy array
    :return: Tuple of (DiagramType, confidence_score)
    """
    # Convert to grayscale for analysis
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    
    # Detect various visual elements
    has_vertical_bars = detect_vertical_bars(gray)
    has_horizontal_bars = detect_horizontal_bars(gray)
    has_lines = detect_lines(gray)
    has_points = detect_points(gray)
    has_circles = detect_circles(gray)
    has_arrows = detect_arrows(gray)
    has_boxes = detect_rectangular_shapes(gray)
    has_network = detect_network_pattern(gray)
    
    # Simple rule-based classification
    type_scores = {
        DiagramType.BAR_CHART: 0.0,
        DiagramType.LINE_GRAPH: 0.0,
        DiagramType.SCATTER_PLOT: 0.0,
        DiagramType.PIE_CHART: 0.0,
        DiagramType.FLOW_CHART: 0.0,
        DiagramType.NETWORK_DIAGRAM: 0.0,
        DiagramType.VENN_DIAGRAM: 0.0,
        DiagramType.CHEMICAL_STRUCTURE: 0.0,
        DiagramType.UNKNOWN: 0.2  # Default baseline
    }
    
    # Bar chart detection
    if has_vertical_bars > 3 or has_horizontal_bars > 3:
        type_scores[DiagramType.BAR_CHART] = 0.6 + min(has_vertical_bars, has_horizontal_bars) * 0.02
        
    # Line graph detection
    if has_lines > 2 and has_points:
        type_scores[DiagramType.LINE_GRAPH] = 0.5 + min(has_lines * 0.1, 0.4)
        
    # Scatter plot detection
    if has_points > 15 and not has_lines:
        type_scores[DiagramType.SCATTER_PLOT] = 0.5 + min(has_points * 0.005, 0.4)
        
    # Pie chart detection
    if has_circles > 0 and detect_pie_segments(gray):
        type_scores[DiagramType.PIE_CHART] = 0.7 + min(has_circles * 0.1, 0.2)
        
    # Flow chart detection
    if has_boxes > 3 and has_arrows > 2:
        type_scores[DiagramType.FLOW_CHART] = 0.6 + min((has_boxes + has_arrows) * 0.02, 0.3)
        
    # Network diagram detection
    if has_network and has_points > 5:
        type_scores[DiagramType.NETWORK_DIAGRAM] = 0.7
        
    # Venn diagram detection
    if has_circles >= 2 and has_circles <= 5 and detect_overlapping_circles(gray):
        type_scores[DiagramType.VENN_DIAGRAM] = 0.8
        
    # Chemical structure detection
    if detect_chemical_bonds(gray) and has_points > 3:
        type_scores[DiagramType.CHEMICAL_STRUCTURE] = 0.75
    
    # Find diagram type with highest score
    best_type = max(type_scores.items(), key=lambda x: x[1])
    
    return best_type[0], best_type[1]

def extract_specific_features(image: np.ndarray, diagram_type: DiagramType) -> Dict[str, Any]:
    """
    Extract features specific to the diagram type
    
    :param image: Image as numpy array
    :param diagram_type: Type of diagram
    :return: Dictionary of type-specific features
    """
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    features = {}
    
    if diagram_type == DiagramType.BAR_CHART:
        # Extract bar chart specific features
        vertical_bars, v_bar_heights = detect_bar_details(gray, orientation="vertical")
        horizontal_bars, h_bar_widths = detect_bar_details(gray, orientation="horizontal")
        
        is_vertical = vertical_bars > horizontal_bars
        bar_count = vertical_bars if is_vertical else horizontal_bars
        
        features["orientation"] = "vertical" if is_vertical else "horizontal"
        features["bar_count"] = bar_count
        
        if is_vertical and v_bar_heights:
            features["min_bar_height"] = min(v_bar_heights)
            features["max_bar_height"] = max(v_bar_heights)
            features["avg_bar_height"] = sum(v_bar_heights) / len(v_bar_heights)
        elif not is_vertical and h_bar_widths:
            features["min_bar_width"] = min(h_bar_widths)
            features["max_bar_width"] = max(h_bar_widths)
            features["avg_bar_width"] = sum(h_bar_widths) / len(h_bar_widths)
        
        features["has_grid_lines"] = detect_grid_lines(gray)
            
    elif diagram_type == DiagramType.LINE_GRAPH:
        # Extract line graph specific features
        line_count, line_points = detect_line_details(gray)
        
        features["line_count"] = line_count
        features["has_markers"] = detect_points(gray, threshold=10) > 10
        features["has_grid_lines"] = detect_grid_lines(gray)
        
        if line_points:
            # Analyze line shapes
            num_increasing = 0
            num_decreasing = 0
            num_flat = 0
            
            for points in line_points:
                if len(points) >= 2:
                    # Determine trend
                    first_y = points[0][1]
                    last_y = points[-1][1]
                    
                    if last_y < first_y:  # Y increases downward in image coordinates
                        num_increasing += 1
                    elif last_y > first_y:
                        num_decreasing += 1
                    else:
                        num_flat += 1
            
            features["trends"] = {
                "increasing": num_increasing,
                "decreasing": num_decreasing,
                "flat": num_flat
            }
        
    elif diagram_type == DiagramType.SCATTER_PLOT:
        # Extract scatter plot specific features
        point_count, point_coords = detect_point_details(gray)
        
        features["point_count"] = point_count
        features["has_grid_lines"] = detect_grid_lines(gray)
        
        if point_coords and len(point_coords) > 10:
            # Simple clustering by distance
            cluster_count = estimate_clusters(point_coords)
            features["estimated_cluster_count"] = cluster_count
        
    elif diagram_type == DiagramType.PIE_CHART:
        # Extract pie chart specific features
        segment_count = detect_pie_segment_count(gray)
        
        features["segment_count"] = segment_count
        features["has_labels"] = detect_text_regions(gray) > 2
        
    elif diagram_type == DiagramType.FLOW_CHART:
        # Extract flow chart specific features
        box_count, box_sizes = detect_box_details(gray)
        arrow_count, arrow_directions = detect_arrow_details(gray)
        
        features["box_count"] = box_count
        features["arrow_count"] = arrow_count
        
        if box_sizes:
            features["avg_box_size"] = sum(box_sizes) / len(box_sizes)
            features["varied_box_sizes"] = max(box_sizes) / min(box_sizes) > 2
        
        if arrow_directions:
            direction_counts = {
                "horizontal": arrow_directions.count("horizontal"),
                "vertical": arrow_directions.count("vertical"),
                "diagonal": arrow_directions.count("diagonal")
            }
            features["arrow_directions"] = direction_counts
            features["flow_complexity"] = 1 + (direction_counts["vertical"] + direction_counts["diagonal"]) / max(1, arrow_count)
        
    elif diagram_type == DiagramType.NETWORK_DIAGRAM:
        # Extract network diagram specific features
        node_count, edge_count = detect_network_details(gray)
        
        features["node_count"] = node_count
        features["edge_count"] = edge_count
        features["node_edge_ratio"] = node_count / max(1, edge_count)
        
        # Estimate network complexity
        complexity = edge_count / max(1, node_count)
        if complexity < 1:
            features["complexity"] = "low"
        elif complexity < 2:
            features["complexity"] = "medium"
        else:
            features["complexity"] = "high"
    
    elif diagram_type == DiagramType.CHEMICAL_STRUCTURE:
        # Extract chemical structure specific features
        atom_count, bond_count = detect_chemical_structure_details(gray)
        
        features["atom_count"] = atom_count
        features["bond_count"] = bond_count
        features["ring_count"] = detect_ring_structures(gray)
        
    return features

# Detection helper functions (implementations would need to be expanded)
def has_light_background(image: np.ndarray) -> bool:
    """Detect if image has a light/white background"""
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    h, w = gray.shape
    
    # Check corners and center for light values
    corners = [
        gray[0, 0],
        gray[0, w-1],
        gray[h-1, 0],
        gray[h-1, w-1],
        gray[h//2, w//2]
    ]
    
    return sum(p > 200 for p in corners) >= 3  # If majority of checked points are light

def detect_vertical_bars(gray: np.ndarray) -> int:
    """Detect number of vertical bars"""
    # Simple placeholder - would need more sophisticated implementation
    edges = cv2.Canny(gray, 50, 150)
    lines = cv2.HoughLinesP(edges, 1, np.pi/180, threshold=100, minLineLength=gray.shape[0]//3, maxLineGap=20)
    
    if lines is None:
        return 0
        
    vertical_lines = 0
    for line in lines:
        x1, y1, x2, y2 = line[0]
        angle = abs(np.arctan2(y2 - y1, x2 - x1) * 180 / np.pi)
        if angle > 80 and angle < 100:  # Nearly vertical
            vertical_lines += 1
            
    return vertical_lines // 2  # Approximate bar count (each bar has 2 edges)

def detect_horizontal_bars(gray: np.ndarray) -> int:
    """Detect number of horizontal bars"""
    # Simple placeholder - would need more sophisticated implementation
    edges = cv2.Canny(gray, 50, 150)
    lines = cv2.HoughLinesP(edges, 1, np.pi/180, threshold=100, minLineLength=gray.shape[1]//3, maxLineGap=20)
    
    if lines is None:
        return 0
        
    horizontal_lines = 0
    for line in lines:
        x1, y1, x2, y2 = line[0]
        angle = abs(np.arctan2(y2 - y1, x2 - x1) * 180 / np.pi)
        if (angle < 10 or angle > 170):  # Nearly horizontal
            horizontal_lines += 1
            
    return horizontal_lines // 2  # Approximate bar count (each bar has 2 edges)

def detect_lines(gray: np.ndarray) -> int:
    """Detect number of significant lines"""
    edges = cv2.Canny(gray, 50, 150)
    lines = cv2.HoughLinesP(edges, 1, np.pi/180, threshold=80, minLineLength=max(gray.shape[0], gray.shape[1])//5, maxLineGap=20)
    
    if lines is None:
        return 0
    
    # Filter out very short lines
    significant_lines = 0
    min_length = max(gray.shape[0], gray.shape[1]) // 10
    
    for line in lines:
        x1, y1, x2, y2 = line[0]
        length = np.sqrt((x2 - x1)**2 + (y2 - y1)**2)
        if length > min_length:
            significant_lines += 1
            
    return significant_lines

def detect_points(gray: np.ndarray, threshold: int = 30) -> int:
    """Detect number of significant points/markers"""
    # Basic blob detection
    params = cv2.SimpleBlobDetector_Params()
    params.minThreshold = 10
    params.maxThreshold = 200
    params.filterByArea = True
    params.minArea = 5
    params.maxArea = 500
    params.filterByCircularity = True
    params.minCircularity = 0.5
    
    detector = cv2.SimpleBlobDetector_create(params)
    keypoints = detector.detect(gray)
    
    return len(keypoints)

def detect_circles(gray: np.ndarray) -> int:
    """Detect number of circles"""
    # Use Hough Circle Transform
    circles = cv2.HoughCircles(
        gray, cv2.HOUGH_GRADIENT, dp=1, minDist=20,
        param1=50, param2=30, minRadius=10, maxRadius=100
    )
    
    if circles is None:
        return 0
    
    return len(circles[0])

def detect_arrows(gray: np.ndarray) -> int:
    """Detect number of arrows"""
    # Placeholder for arrow detection
    # This is a complex task that might require template matching or ML
    # For simplicity, we'll just estimate based on line patterns
    edges = cv2.Canny(gray, 50, 150)
    
    # Look for arrow-like patterns (Y junctions)
    y_count = 0
    # This would require more sophisticated contour analysis
    
    return y_count

def detect_rectangular_shapes(gray: np.ndarray) -> int:
    """Detect number of rectangular shapes"""
    # Find contours
    _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    rectangles = 0
    for contour in contours:
        # Approximate contour with polygons
        perimeter = cv2.arcLength(contour, True)
        approx = cv2.approxPolyDP(contour, 0.04 * perimeter, True)
        
        # If it has 4 corners, it's likely a rectangle
        if len(approx) == 4:
            rectangles += 1
    
    return rectangles

def detect_network_pattern(gray: np.ndarray) -> bool:
    """Detect if image contains a network pattern"""
    # Look for point clusters connected by lines
    point_count = detect_points(gray)
    line_count = detect_lines(gray)
    
    # Heuristic: networks typically have more lines than points (edges > nodes)
    return point_count > 3 and line_count > point_count

def detect_pie_segments(gray: np.ndarray) -> bool:
    """Detect if image contains pie segment patterns"""
    circles = cv2.HoughCircles(
        gray, cv2.HOUGH_GRADIENT, dp=1, minDist=50,
        param1=50, param2=30, minRadius=30, maxRadius=200
    )
    
    if circles is None or len(circles[0]) == 0:
        return False
    
    # Get the largest circle
    largest_circle = max(circles[0], key=lambda c: c[2])
    center_x, center_y, radius = largest_circle
    
    # Look for lines that might be segment boundaries
    edges = cv2.Canny(gray, 50, 150)
    lines = cv2.HoughLinesP(edges, 1, np.pi/180, threshold=50, minLineLength=radius*0.5, maxLineGap=10)
    
    if lines is None:
        return False
    
    # Count lines that pass near the center
    center_lines = 0
    for line in lines:
        x1, y1, x2, y2 = line[0]
        # Calculate distance from center to line
        dist = np.abs((y2-y1)*center_x - (x2-x1)*center_y + x2*y1 - y2*x1) / np.sqrt((y2-y1)**2 + (x2-x1)**2)
        if dist < radius * 0.2:  # Line passes near center
            center_lines += 1
    
    return center_lines >= 3  # Need at least 3 segments

def detect_overlapping_circles(gray: np.ndarray) -> bool:
    """Detect if image contains overlapping circles (for Venn diagrams)"""
    circles = cv2.HoughCircles(
        gray, cv2.HOUGH_GRADIENT, dp=1, minDist=20,
        param1=50, param2=30, minRadius=20, maxRadius=150
    )
    
    if circles is None or len(circles[0]) < 2:
        return False
    
    # Check if any circles overlap
    for i in range(len(circles[0])):
        for j in range(i+1, len(circles[0])):
            x1, y1, r1 = circles[0][i]
            x2, y2, r2 = circles[0][j]
            
            # Calculate distance between centers
            distance = np.sqrt((x2 - x1)**2 + (y2 - y1)**2)
            
            # Circles overlap if distance is less than sum of radii
            if distance < (r1 + r2) and distance > abs(r1 - r2):
                return True
    
    return False

def detect_chemical_bonds(gray: np.ndarray) -> bool:
    """Detect if image contains chemical bond patterns"""
    # Look for specific patterns of points and connecting lines
    
    # First check if we have points that might be atoms
    point_count = detect_points(gray)
    if point_count < 3:
        return False
    
    # Then look for short connecting lines that might be bonds
    edges = cv2.Canny(gray, 50, 150)
    lines = cv2.HoughLinesP(edges, 1, np.pi/180, threshold=50, minLineLength=10, maxLineGap=5)
    
    if lines is None:
        return False
    
    # Count short lines that could be bonds
    bond_like_lines = 0
    for line in lines:
        x1, y1, x2, y2 = line[0]
        length = np.sqrt((x2 - x1)**2 + (y2 - y1)**2)
        
        # Chemical bonds are typically short, straight lines
        if 10 < length < 50:
            bond_like_lines += 1
    
    # Rough heuristic for chemical structures
    return bond_like_lines > point_count

def detect_bar_details(gray: np.ndarray, orientation: str) -> Tuple[int, List[float]]:
    """Detect details about bars in a bar chart"""
    # This is a simplified placeholder
    if orientation == "vertical":
        count = detect_vertical_bars(gray)
        # Mock heights for now - would need better implementation
        heights = [random.random() * 100 for _ in range(count)] if count > 0 else []
        return count, heights
    else:
        count = detect_horizontal_bars(gray)
        # Mock widths for now - would need better implementation
        widths = [random.random() * 100 for _ in range(count)] if count > 0 else []
        return count, widths

def detect_line_details(gray: np.ndarray) -> Tuple[int, List[List[Tuple[int, int]]]]:
    """Detect details about lines in a line graph"""
    # Placeholder implementation
    line_count = detect_lines(gray)
    
    # For a real implementation, we would trace the actual line paths
    line_points = []
    for _ in range(line_count):
        # Create mock line points
        num_points = random.randint(5, 10)
        points = [(i*10, random.randint(0, 100)) for i in range(num_points)]
        line_points.append(points)
    
    return line_count, line_points

def detect_point_details(gray: np.ndarray) -> Tuple[int, List[Tuple[int, int]]]:
    """Detect details about points in a scatter plot"""
    params = cv2.SimpleBlobDetector_Params()
    params.minThreshold = 10
    params.maxThreshold = 200
    params.filterByArea = True
    params.minArea = 5
    params.maxArea = 500
    
    detector = cv2.SimpleBlobDetector_create(params)
    keypoints = detector.detect(gray)
    
    points = [(int(kp.pt[0]), int(kp.pt[1])) for kp in keypoints]
    return len(points), points

def estimate_clusters(points: List[Tuple[int, int]], distance_threshold: int = 30) -> int:
    """Estimate number of clusters in a set of points"""
    if not points:
        return 0
    
    # Convert to numpy array
    points_array = np.array(points)
    
    # Simple clustering by distance (a more sophisticated approach would use K-means or DBSCAN)
    visited = [False] * len(points)
    cluster_count = 0
    
    for i in range(len(points)):
        if visited[i]:
            continue
            
        # Start a new cluster
        cluster_count += 1
        visited[i] = True
        
        # Find all points in this cluster
        stack = [i]
        while stack:
            current = stack.pop()
            current_point = points_array[current]
            
            # Find neighbors
            for j in range(len(points)):
                if not visited[j]:
                    # Calculate distance
                    other_point = points_array[j]
                    distance = np.sqrt(np.sum((current_point - other_point)**2))
                    
                    if distance < distance_threshold:
                        visited[j] = True
                        stack.append(j)
    
    return cluster_count

def detect_grid_lines(gray: np.ndarray) -> bool:
    """Detect if the image has grid lines"""
    edges = cv2.Canny(gray, 30, 100)
    
    # Look for regularly spaced horizontal and vertical lines
    lines = cv2.HoughLinesP(edges, 1, np.pi/180, threshold=50, minLineLength=gray.shape[1]//4, maxLineGap=10)
    
    if lines is None:
        return False
    
    horizontal_lines = 0
    vertical_lines = 0
    
    for line in lines:
        x1, y1, x2, y2 = line[0]
        angle = abs(np.arctan2(y2 - y1, x2 - x1) * 180 / np.pi)
        
        if angle < 10 or angle > 170:  # Nearly horizontal
            horizontal_lines += 1
        elif 80 < angle < 100:  # Nearly vertical
            vertical_lines += 1
    
    # Require at least 3 of each for it to be considered a grid
    return horizontal_lines >= 3 and vertical_lines >= 3

def detect_pie_segment_count(gray: np.ndarray) -> int:
    """Detect the number of segments in a pie chart"""
    # Placeholder implementation
    if not detect_pie_segments(gray):
        return 0
    
    # This would require a more sophisticated implementation to count actual segments
    # For now, we'll use a heuristic based on edge detection
    edges = cv2.Canny(gray, 50, 150)
    lines = cv2.HoughLinesP(edges, 1, np.pi/180, threshold=50, minLineLength=20, maxLineGap=10)
    
    if lines is None:
        return 0
    
    # Count lines that might be segment boundaries
    center_lines = 0
    
    # Find the approximate center of the pie
    h, w = gray.shape
    center_x, center_y = w//2, h//2
    
    for line in lines:
        x1, y1, x2, y2 = line[0]
        # Calculate distance from center to line
        dist = np.abs((y2-y1)*center_x - (x2-x1)*center_y + x2*y1 - y2*x1) / np.sqrt((y2-y1)**2 + (x2-x1)**2)
        if dist < min(h, w) * 0.1:  # Line passes near center
            center_lines += 1
    
    # Each segment typically has one radial line
    return max(3, center_lines)  # Minimum 3 segments if it's a pie chart

def detect_text_regions(gray: np.ndarray) -> int:
    """Detect number of potential text regions"""
    # This is a simplified approach - real text detection is complex
    _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    
    # Use morphology to identify potential text regions
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
    morphed = cv2.morphologyEx(binary, cv2.MORPH_CLOSE, kernel)
    
    # Find contours that might be text
    contours, _ = cv2.findContours(morphed, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    text_regions = 0
    for contour in contours:
        x, y, w, h = cv2.boundingRect(contour)
        aspect_ratio = float(w) / h
        
        # Text regions typically have specific aspect ratios
        if 0.1 < aspect_ratio < 10 and w > 10 and h > 5:
            text_regions += 1
    
    return text_regions

def detect_box_details(gray: np.ndarray) -> Tuple[int, List[float]]:
    """Detect details about boxes in a flow chart"""
    # Find contours
    _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    box_count = 0
    box_sizes = []
    
    for contour in contours:
        # Approximate contour with polygons
        perimeter = cv2.arcLength(contour, True)
        approx = cv2.approxPolyDP(contour, 0.04 * perimeter, True)
        
        # If it has 4 corners, it's likely a rectangle
        if len(approx) == 4:
            box_count += 1
            
            # Calculate area
            area = cv2.contourArea(contour)
            box_sizes.append(area)
    
    return box_count, box_sizes

def detect_arrow_details(gray: np.ndarray) -> Tuple[int, List[str]]:
    """Detect details about arrows in a flow chart"""
    # Placeholder - arrow detection is complex
    # For a real implementation, we might use template matching or ML approaches
    
    # Mock data for illustration
    arrow_count = random.randint(0, 5)
    directions = []
    
    for _ in range(arrow_count):
        directions.append(random.choice(["horizontal", "vertical", "diagonal"]))
    
    return arrow_count, directions

def detect_network_details(gray: np.ndarray) -> Tuple[int, int]:
    """Detect details about nodes and edges in a network diagram"""
    # Placeholder implementation
    node_count = detect_points(gray)
    
    # Estimate edge count
    # In a real implementation, we would analyze the connections between nodes
    edge_count = int(1.5 * node_count)  # Rough approximation
    
    return node_count, edge_count

def detect_chemical_structure_details(gray: np.ndarray) -> Tuple[int, int]:
    """Detect details about atoms and bonds in a chemical structure"""
    # Placeholder implementation
    atom_count = detect_points(gray)
    
    # Estimate bond count
    # In a real implementation, we would analyze the connections between atoms
    bond_count = int(1.2 * atom_count)  # Rough approximation
    
    return atom_count, bond_count

def detect_ring_structures(gray: np.ndarray) -> int:
    """Detect number of ring structures in a chemical diagram"""
    # Placeholder implementation
    # For a real implementation, we would use more sophisticated graph analysis
    
    # Find contours that might represent rings
    _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    
    ring_count = 0
    for contour in contours:
        # Calculate circularity
        area = cv2.contourArea(contour)
        perimeter = cv2.arcLength(contour, True)
        
        if perimeter > 0:
            circularity = 4 * np.pi * area / (perimeter * perimeter)
            
            # Rings typically have high circularity
            if 0.6 < circularity < 1.0 and area > 100:
                ring_count += 1
    
    return ring_count

# Don't forget to import random at the top of the file
import random

# Make sure to include this at the end of the file if you plan to run it directly
if __name__ == "__main__":
    # Example usage
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python diagram_features.py <image_path>")
        sys.exit(1)
        
    image_path = sys.argv[1]
    features = extract_diagram_features(image_path)
    
    print(f"Diagram Type: {features.diagram_type.value} (confidence: {features.type_confidence:.2f})")
    print("\nGeneral Features:")
    for key, value in features.general_features.items():
        print(f"  {key}: {value}")
        
    print("\nSpecific Features:")
    for key, value in features.specific_features.items():
        print(f"  {key}: {value}")