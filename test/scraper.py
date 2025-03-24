import os
import time
import requests
import io
import hashlib
from PIL import Image
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

def scrape_google_images(search_query, num_images=10, output_folder='downloaded_images'):
    """
    Scrape and download images from Google Images
    
    Parameters:
    - search_query: Search term (e.g., "chemistry diagram")
    - num_images: Number of images to download
    - output_folder: Base folder to save images
    """
    # Create folder structure
    query_folder = os.path.join(output_folder, search_query.replace(' ', '_'))
    os.makedirs(query_folder, exist_ok=True)
    
    # Set up Chrome options
    chrome_options = Options()
    chrome_options.add_argument("--headless")  # Run in headless mode
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36")
    
    print(f"Setting up WebDriver for: {search_query}")
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)
    
    # Construct search URL with specific query to get diagram images
    query = f"{search_query} filetype:png OR filetype:jpg OR filetype:jpeg"
    url = f"https://www.google.com/search?q={query.replace(' ', '+')}&tbm=isch"
    
    driver.get(url)
    print(f"Navigated to Google Images for: {search_query}")
    
    # Scroll to load more images
    scroll_count = 0
    max_scrolls = 5  # Limit scrolling to avoid loading too many images
    
    while scroll_count < max_scrolls:
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(2)
        scroll_count += 1
    
    # Wait for image elements to load
    WebDriverWait(driver, 10).until(
        EC.presence_of_all_elements_located((By.CSS_SELECTOR, "img.rg_i, img.Q4LuWd"))
    )
    
    # Find all image elements
    images = driver.find_elements(By.CSS_SELECTOR, "img.rg_i, img.Q4LuWd")
    print(f"Found {len(images)} potential images for '{search_query}'")
    
    # Download images
    count = 0
    for img in images:
        if count >= num_images:
            break
        
        try:
            # Click on the image to load the full resolution version
            driver.execute_script("arguments[0].scrollIntoView();", img)
            driver.execute_script("arguments[0].click();", img)
            
            # Wait for the full-resolution image to appear
            time.sleep(2)
            
            # Try to get the full-resolution image
            full_img = WebDriverWait(driver, 5).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "img.r48jcc, img.n3VNCb, img.iPVvYb"))
            )
            
            img_url = full_img.get_attribute('src')
            
            # Skip small thumbnail images and data URLs
            if img_url.startswith('data:') or not img_url.startswith('http'):
                continue
                
            # Download the image
            try:
                response = requests.get(img_url, timeout=10)
                if response.status_code == 200:
                    # Try to open the image to verify it's valid
                    image = Image.open(io.BytesIO(response.content))
                    
                    # Skip very small images
                    if image.width < 300 or image.height < 300:
                        continue
                    
                    # Create a unique filename based on image content
                    img_hash = hashlib.md5(response.content).hexdigest()
                    extension = image.format.lower() if image.format else 'jpg'
                    filename = f"{search_query.replace(' ', '_')}_{count}_{img_hash[:8]}.{extension}"
                    
                    # Save the image
                    image.save(os.path.join(query_folder, filename))
                    print(f"Downloaded: {filename}")
                    count += 1
            except Exception as e:
                print(f"Error downloading {img_url}: {e}")
        
        except Exception as e:
            print(f"Error processing image: {e}")
    
    driver.quit()
    print(f"Downloaded {count} images for '{search_query}'")
    return count

def main():
    """Main function to run the scraper for multiple topics"""
    # Create base output folder
    base_folder = 'diagram_samples'
    os.makedirs(base_folder, exist_ok=True)
    
    # Define diagram categories and search queries
    diagram_categories = [
        # Subject-specific diagrams
        "chemistry molecular diagram",
        "physics circuit diagram",
        "math geometry diagram",
        "biology cell diagram",
        "computer science flowchart diagram",
        "engineering schematic diagram",
        
        # Diagram types
        "UML class diagram",
        "entity relationship diagram",
        "network topology diagram",
        "sequence diagram",
        "state machine diagram",
        "data flow diagram",
        
        # Quality variations
        "high quality technical diagram",
        "hand drawn diagram",
        "textbook diagram",
        "scientific diagram with labels"
    ]
    
    total_downloaded = 0
    
    # Download images for each category
    for category in diagram_categories:
        print(f"\n{'='*50}")
        print(f"Downloading {category} images...")
        print(f"{'='*50}")
        
        images_downloaded = scrape_google_images(
            search_query=category,
            num_images=5,  # Limit to 5 per category to avoid too many images
            output_folder=base_folder
        )
        
        total_downloaded += images_downloaded
    
    print(f"\n{'='*50}")
    print(f"Completed downloading {total_downloaded} diagram images")
    print(f"Images saved in: {os.path.abspath(base_folder)}")
    print(f"{'='*50}")

if __name__ == "__main__":
    main()