FROM python:3.10-slim

# Install Chrome dependencies
RUN apt-get update && apt-get install -y \
    curl unzip gnupg wget xvfb libxi6 libgconf-2-4 libnss3 libxss1 libappindicator1 \
    fonts-liberation libatk-bridge2.0-0 libgtk-3-0 libdrm2 libgbm1 libu2f-udev \
    && apt-get clean

# Add Google's public signing key and Chrome repo
RUN wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add - \
    && echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" \
    > /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update && apt-get install -y google-chrome-stable

# Set working dir
WORKDIR /app

# Install Python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the scraper
COPY scraper.py .

# Run scraper
CMD ["python", "scraper.py"]
