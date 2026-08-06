import os
from dotenv import load_dotenv
from pydantic_settings import BaseSettings

# Load .env file from current or parent directory
load_dotenv()
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))
load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

class Settings(BaseSettings):
    APP_NAME: str = "Enterprise AI Support Ticket System"
    ENV: str = os.getenv("ENV", "development")
    
    # API Keys (cloud LLM integrations)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
    # Dynamically configurable confidence threshold (0.0 to 1.0)
    CONFIDENCE_THRESHOLD: float = float(os.getenv("CONFIDENCE_THRESHOLD", "0.85"))
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./tickets_ai.db")

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

