FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY api.py .
COPY main.py .
COPY observer_pattern.py .
COPY filter3_update.py .
COPY filter1_symbols.py .
COPY filter2_last_date.py .
COPY data_pipeline.py .
COPY export_to_json.py .

# Copy shared resources (will be mounted via volume in docker-compose)
# Database and data directories will be available via volume mounts

# Expose port
EXPOSE 8000

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]



