# ---------- Stage 1 : Builder ----------
FROM python:3.12-slim AS builder

# Prevent Python from writing .pyc files
ENV PYTHONDONTWRITEBYTECODE=1

# Disable output buffering
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install system packages (if required)
RUN apt-get update && apt-get install -y gcc

# Copy dependency file
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# Copy application source
COPY . .

# ---------- Stage 2 : Production ----------
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Copy installed packages from builder
COPY --from=builder /install /usr/local

# Copy application code
COPY --from=builder /app .

# FastAPI port
EXPOSE 8000

# Start FastAPI
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]