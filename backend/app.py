"""
SkillPilot AI - Flask Backend Application
Production-ready REST API for learning management with AI integration
"""
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from decouple import config as env_config

from config import config_dict
from models import db, TokenBlocklist
from routes_auth import auth_bp
from routes_goals import goals_bp
from routes_profile import profile_bp
from routes_analytics import analytics_bp
from routes_ai import ai_bp
from routes_lessons import lessons_bp
from services.ai_service import AIService


def create_app(config_name='default'):
    """Application factory pattern"""
    
    app = Flask(__name__)
    
    # Load configuration
    app.config.from_object(config_dict[config_name])
    
    # Initialize extensions
    db.init_app(app)
    migrate = Migrate(app, db)
    jwt = JWTManager(app)
    
    # Configure CORS - Allow all origins for development
    CORS(app, 
         resources={r"/api/*": {"origins": "*"}},
         methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
         allow_headers=["Content-Type", "Authorization"],
         expose_headers=["Content-Type", "Authorization"],
         supports_credentials=True
    )
    
    # JWT token blocklist loader
    @jwt.token_in_blocklist_loader
    def check_if_token_revoked(jwt_header, jwt_payload):
        jti = jwt_payload['jti']
        token = TokenBlocklist.query.filter_by(jti=jti).first()
        return token is not None
    
    # JWT error handlers
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({
            'error': 'Token has expired',
            'message': 'Please refresh your token'
        }), 401
    
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({
            'error': 'Invalid token',
            'message': 'Token verification failed'
        }), 401
    
    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({
            'error': 'Authorization required',
            'message': 'Request does not contain an access token'
        }), 401
    
    @jwt.revoked_token_loader
    def revoked_token_callback(jwt_header, jwt_payload):
        return jsonify({
            'error': 'Token has been revoked',
            'message': 'Please login again'
        }), 401
    
    # Register blueprints
    app.register_blueprint(auth_bp)
    app.register_blueprint(goals_bp)
    app.register_blueprint(profile_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(ai_bp)
    app.register_blueprint(lessons_bp)
    
    # Root route
    @app.route('/')
    def index():
        return jsonify({
            'message': 'Welcome to SkillPilot AI API',
            'version': '2.0.0',
            'status': 'running',
            'features': [
                'User authentication with JWT',
                'AI-powered learning roadmaps',
                'Progress tracking and analytics',
                'AI chat assistant',
                'User profiles with avatar upload',
                'Comprehensive insights and recommendations'
            ]
        }), 200
    
    # Serve uploaded files
    @app.route('/uploads/<filename>')
    def serve_upload(filename):
        """Serve uploaded files"""
        import os
        upload_folder = os.path.join(os.path.dirname(__file__), 'uploads')
        filepath = os.path.join(upload_folder, filename)
        
        if os.path.exists(filepath) and os.path.isfile(filepath):
            from flask import send_file
            return send_file(filepath)
        
        return jsonify({'error': 'File not found'}), 404
    
    # Health check
    @app.route('/health')
    def health():
        return jsonify({'status': 'healthy'}), 200
    
    # Create tables
    with app.app_context():
        db.create_all()
    
    return app


# Create application instance
app = create_app(env_config('FLASK_ENV', default='development'))


if __name__ == '__main__':
    app.run(
        host='0.0.0.0',
        port=8000,
        debug=True
    )
