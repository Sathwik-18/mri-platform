"""
MRI Platform Backend - Flask Application
Main entry point for the API server.
"""

import logging
from flask import Flask
from flask_cors import CORS

from config import (
    FLASK_DEBUG, FLASK_HOST, FLASK_PORT,
    MAX_CONTENT_LENGTH, CORS_ORIGINS
)
from routes import api_bp

# Configure logging to show all messages
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)


def create_app():
    """
    Application factory function.

    Returns:
        Flask application instance
    """
    app = Flask(__name__)

    # Configuration
    app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH
    app.config['JSON_SORT_KEYS'] = False

    # CORS
    CORS(app, origins=CORS_ORIGINS, supports_credentials=True)

    # Register blueprints
    app.register_blueprint(api_bp)

    # Root endpoint
    @app.route('/')
    def index():
        return {
            'name': 'MRI Platform API',
            'version': '1.0.0',
            'status': 'running',
            'endpoints': {
                'health': '/api/health',
                'analyze': '/api/analyze [POST]',
                'session_status': '/api/session/<id>/status [GET]',
                'session_reports': '/api/session/<id>/reports [GET]'
            }
        }

    return app


# Create app instance
app = create_app()


if __name__ == '__main__':
    print(f"""
    ╔══════════════════════════════════════════════════════════════╗
    ║          MRI Platform Backend Server                         ║
    ║──────────────────────────────────────────────────────────────║
    ║  Server:  http://{FLASK_HOST}:{FLASK_PORT}                           ║
    ║  Debug:   {FLASK_DEBUG}                                             ║
    ║  CORS:    {', '.join(CORS_ORIGINS[:2])}...                      ║
    ╚══════════════════════════════════════════════════════════════╝
    """)

    app.run(
        host=FLASK_HOST,
        port=FLASK_PORT,
        debug=FLASK_DEBUG
    )
