import uvicorn
import os
import sys

# Ensure backend directory is in python path so imports work when running from repo root
sys.path.append(os.path.join(os.path.dirname(__file__), "backend"))

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    print("==========================================================")
    print(" 🚀 Starting AI Support Ticket System Backend API Gateway ")
    print(f" URL: http://{host}:{port}")
    print(f" API Docs: http://{host}:{port}/docs")
    print("==========================================================")
    # In production do not use reload. Use a production server (gunicorn + uvicorn worker) on Render.
    uvicorn.run("backend.main:app", host=host, port=port, reload=False)
