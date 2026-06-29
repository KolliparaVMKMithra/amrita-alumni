FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev gcc && rm -rf /var/lib/apt/lists/*

# Copy requirements first for layer caching
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy source code
COPY backend/ ./backend/

# Expose port
EXPOSE 8000

# Run the app
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
