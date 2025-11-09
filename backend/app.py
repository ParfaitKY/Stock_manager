import os
from flask import Flask
from dotenv import load_dotenv
from flask_cors import CORS
from .extensions import db, jwt, migrate
from .config import Config
from .routes.auth import auth_bp
from .routes.products import products_bp
from .routes.movements import movements_bp
from .routes.admin import admin_bp


def create_app():
    load_dotenv()
    app = Flask(__name__)
    app.config.from_object(Config)

    # Enable CORS for frontend dev server (support multiple origins and Authorization header)
    cors_origins_cfg = app.config.get("CORS_ORIGINS", "*")
    if isinstance(cors_origins_cfg, str) and "," in cors_origins_cfg:
        cors_origins = [o.strip() for o in cors_origins_cfg.split(",")]
    else:
        cors_origins = cors_origins_cfg
    CORS(
        app,
        resources={r"/api/*": {
            "origins": cors_origins,
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": True,
        }},
    )

    # Init extensions
    db.init_app(app)
    jwt.init_app(app)
    migrate.init_app(app, db)

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(products_bp, url_prefix="/api")
    app.register_blueprint(movements_bp, url_prefix="/api")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")

    @app.route("/api/health")
    def health():
        return {"status": "ok"}

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5000)))

