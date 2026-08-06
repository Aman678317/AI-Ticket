import uvicorn
import os
import sys

# Ensure backend directory is in python path
sys.path.append(os.path.join(os.path.dirname(__file__), "backend"))

if __name__ == "__main__":
    print("==========================================================")
    print(" 🚀 Starting AI Support Ticket System Backend API Gateway ")
    print(" URL: http://127.0.0.1:8000")
    print(" API Docs: http://127.0.0.1:8000/docs")
    print("==========================================================")
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=True)
