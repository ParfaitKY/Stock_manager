import os


class Config:
    SECRET_KEY = os.getenv("JWT_SECRET", "dev-secret-change-me")
    JWT_SECRET_KEY = SECRET_KEY
    SQLALCHEMY_DATABASE_URI = os.getenv(
        "MYSQL_URI",
        # Default to local MySQL via PyMySQL; adjust as needed
        "mysql+pymysql://root:@localhost/stock"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Allow local dev Vite server by default
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")

