FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY sentiment-service/requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Download NLTK data for TextBlob (if needed)
RUN python -m textblob.download_corpora || true

# Copy application code
COPY sentiment-service/main.py main.py

# Expose port
EXPOSE 8008

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8008"]



