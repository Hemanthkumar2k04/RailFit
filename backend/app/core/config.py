from pydantic_settings import BaseSettings
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    # App Config
    app_name: str = "RailFIT API"
    version: str = "1.0.0"
    debug: bool = os.getenv("DEBUG", "true").lower() == "true"
    
    # Supabase Database Config (PostgreSQL)
    database_url: str = os.getenv("DATABASE_URL")
    supabase_url: str = os.getenv("SUPABASE_URL")
    supabase_anon_key: str = os.getenv("SUPABASE_ANON_KEY")
    supabase_service_role_key: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    
    # JWT Config
    jwt_secret_key: str = os.getenv("JWT_SECRET_KEY")
    jwt_algorithm: str = os.getenv("JWT_ALGORITHM", "HS256")
    jwt_access_token_expire_minutes: int = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))  # 24 hours
    
    # Security
    bcrypt_rounds: int = 12
    
    # CORS
    # Allow configuring allowed origins via the ALLOWED_ORIGINS environment variable (comma-separated).
    # Example: ALLOWED_ORIGINS="https://my-frontend.vercel.app,https://example.com"
    _allowed_origins_str: str = os.getenv("ALLOWED_ORIGINS", "")
    
    @property
    def allowed_origins(self) -> list[str]:
        """Parse allowed origins from env var or use defaults"""
        if self._allowed_origins_str:
            return [origin.strip() for origin in self._allowed_origins_str.split(",") if origin.strip()]
        return ["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000", "http://127.0.0.1:5173", "https://rail-9s0az9gvu-hemanthkumar-ks-projects.vercel.app/"]
    
    # File Upload
    max_file_size_mb: int = int(os.getenv("MAX_FILE_SIZE_MB", "10"))
    upload_dir: str = os.getenv("UPLOAD_DIR", "uploads/")
    
    @property
    def max_file_size(self) -> int:
        return self.max_file_size_mb * 1024 * 1024  # Convert MB to bytes
    
    def validate_config(self) -> bool:
        """Validate that all required environment variables are set"""
        required_vars = [
            "DATABASE_URL", "SUPABASE_URL", "SUPABASE_ANON_KEY", 
            "JWT_SECRET_KEY"
        ]
        missing = []
        for var in required_vars:
            value = getattr(self, var.lower(), None)
            if not value or value == f"your-{var.lower().replace('_', '-')}-here":
                missing.append(var)
        
        if missing:
            print(f"Warning: Missing or placeholder values for: {', '.join(missing)}")
            print("Please update your .env file with actual values for production use.")
            # Only raise error for critical missing vars in production
            if not self.debug and missing:
                raise ValueError(f"Missing required environment variables: {', '.join(missing)}")
        return True
    
    model_config = {"env_file": ".env", "extra": "ignore"}

# Create global settings instance
settings = Settings()