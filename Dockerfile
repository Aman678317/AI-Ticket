# Multi-stage Dockerfile: build frontend (Vite) then run Python FastAPI backend with Gunicorn + Uvicorn worker

# --- Frontend build stage ---
FROM node:18-alpine AS frontend_build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --silent
COPY frontend/ ./
RUN npm run build

# --- Python runtime stage ---
FROM python:3.10-slim
WORKDIR /app

# Install system deps needed for some Python packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    libffi-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy backend code
COPY backend/ ./backend/
# Copy requirements and install (gunicorn & uvicorn are in requirements)
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy built frontend into backend static folder (adjust if backend expects a different static path)
COPY --from=frontend_build /app/frontend/dist ./backend/static

ENV PYTHONUNBUFFERED=1
ENV PORT=10000
EXPOSE 10000

# Healthcheck (optional)
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s CMD curl -f http://localhost:${PORT}/ || exit 1

# Run with Gunicorn + Uvicorn worker
CMD ["sh", "-c", "gunicorn -w 4 -k uvicorn.workers.UvicornWorker backend.main:app --bind 0.0.0.0:$PORT"]
