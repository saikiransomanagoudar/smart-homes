from flask import Flask
from flask_cors import CORS
import logging

def create_app():
    app = Flask(__name__)

    # Enable CORS with credentials support
    CORS(
        app,
        resources={r"/*": {"origins": "http://localhost:3000"}},
        supports_credentials=True,
    )

    logging.basicConfig(level=logging.DEBUG,  # Change log level to DEBUG
                        format="%(asctime)s - %(levelname)s - %(message)s")

    logger = logging.getLogger("flask.app")
    logger.setLevel(logging.DEBUG)

    # Register Blueprints or routes
    from .routes import main
    app.register_blueprint(main)

    return app

