# Use slim Python 3.11 image
FROM python:3.11-slim

# Set working directory
WORKDIR /app/backend

# ---------------------------
# 1️⃣ Install system dependencies
# ---------------------------
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    supervisor \
    tesseract-ocr \
    wget \
    git \
    && rm -rf /var/lib/apt/lists/*

# ---------------------------
# 2️⃣ Copy requirements first for caching
# ---------------------------
COPY requirements.txt .

# ---------------------------
# 3️⃣ Install Python dependencies including DeepFace, tf-keras, pytesseract, uvicorn
# ---------------------------
RUN pip install --no-cache-dir -r requirements.txt \
    && pip install --no-cache-dir deepface tf-keras pytesseract uvicorn

# ---------------------------
# 4️⃣ Optional: remove pandas tests to save space on macOS exports
# ---------------------------
RUN rm -rf /usr/local/lib/python3.11/site-packages/pandas/tests \
       /usr/local/lib/python3.11/site-packages/pandas/__pycache__ \
       /usr/local/lib/python3.11/site-packages/pandas/core/__pycache__

# ---------------------------
# 5️⃣ Copy backend code
# ---------------------------
COPY . .

# ---------------------------
# 6️⃣ Copy supervisor config
# ---------------------------
COPY backend.conf /etc/supervisor/conf.d/backend.conf

# ---------------------------
# 7️⃣ Expose port
# ---------------------------
EXPOSE 5000

# ---------------------------
# 8️⃣ Default command
# ---------------------------
CMD ["supervisord", "-n"]
