from pydantic_settings import BaseSettings
from datetime import timedelta
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "FastAPI Project"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "FastAPI Project Description"
    API_V1_STR: str = "/api/v1"
    
    # Database settings
    POSTGRES_USER: str = "root"
    POSTGRES_PASSWORD: str = "mysecretpassword"
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_PORT: str = "5432"
    POSTGRES_DB: str = "mydb"
    POSTGRES_SCHEMA: str = "doctorcare"
    
    # Database pool settings
    DB_POOL_SIZE: int = 5
    DB_MAX_OVERFLOW: int = 10
    
    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
    
    # JWT Settings
    SECRET_KEY: str = "your-secret-key-here"  # Thay đổi trong production
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60*24
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Cookie settings
    COOKIE_SECURE: bool = False  # Set True in production
    COOKIE_SAMESITE: str = "none"
    DOMAIN: str = "localhost"
    
    # CORS Settings
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:8000",
    ]
    CORS_METHODS: List[str] = [
        "GET",
        "POST", 
        "PUT",
        "DELETE",
        "OPTIONS",
        "PATCH",
    ]
    CORS_HEADERS: List[str] = [
        "Content-Type",
        "Authorization",
        "accept",
        "Origin",
        "User-Agent",
        "DNT",
        "Cache-Control",
        "X-Mx-ReqToken",
        "Keep-Alive",
        "X-Requested-With",
        "If-Modified-Since",
        "x-api-key",
        "upload-type"
    ]
    CORS_CREDENTIALS: bool = True
    
    PORT: int = 8001
    
    # Email Settings
    MAIL_USERNAME: str = "learningfjd@gmail.com"
    MAIL_PASSWORD: str = "xtvb ypet erwn cxqn"  # App password for Gmail
    MAIL_FROM: str = "learningfjd@gmail.com"
    MAIL_PORT: int = 587  # Port for TLS
    MAIL_SERVER: str = "smtp.gmail.com"
    MAIL_FROM_NAME: str = "DoctorCare"
    MAIL_STARTTLS: bool = True
    MAIL_SSL_TLS: bool = False
    USE_CREDENTIALS: bool = True
    MAIL_TIMEOUT: int = 60

    # Template Settings
    EMAIL_TEMPLATES_DIR: str = "app/templates/email"

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings() 