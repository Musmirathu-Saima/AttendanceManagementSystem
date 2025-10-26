# ======== BASE IMAGE ========
FROM python:3.9-slim

# ======== INSTALL SYSTEM DEPENDENCIES ========
RUN apt-get update && apt-get install -y \
    cmake \
    g++ \
    libboost-all-dev \
    libopenblas-dev \
    liblapack-dev \
    libjpeg-dev \
    libpng-dev \
    supervisor \
    && rm -rf /var/lib/apt/lists/*

# ======== SETUP WORKDIR ========
WORKDIR /app/backend

# ======== COPY REQUIREMENTS ========
COPY requirements.txt .

# ======== INSTALL PYTHON DEPENDENCIES ========
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# ======== COPY APPLICATION FILES ========
COPY . .

# ======== SUPERVISOR CONFIG ========
COPY backend.conf /etc/supervisor/conf.d/backend.conf

# ======== RUN SUPERVISOR ========
CMD ["supervisord", "-n"]
