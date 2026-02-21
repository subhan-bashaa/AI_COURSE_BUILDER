"""
Authentication Routes for SkillPilot AI
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
    get_jwt
)
from models import db, User, TokenBlocklist

auth_bp = Blueprint('auth', __name__, url_prefix='/api')


@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    data = request.get_json()
    
    # Validate input
    if not data or not data.get('username') or not data.get('email') or not data.get('password'):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Check if user already exists
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'error': 'Username already exists'}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email already exists'}), 400
    
    # Create new user
    user = User(
        username=data['username'],
        email=data['email']
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    # Generate tokens
    access_token = create_access_token(identity=user.id)
    refresh_token = create_refresh_token(identity=user.id)
    
    return jsonify({
        'message': 'User registered successfully',
        'user': user.to_dict(),
        'access': access_token,
        'refresh': refresh_token
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    """User login"""
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Missing username or password'}), 400
    
    # Find user
    user = User.query.filter_by(username=data['username']).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    # Generate tokens
    access_token = create_access_token(identity=user.id)
    refresh_token = create_refresh_token(identity=user.id)
    
    return jsonify({
        'message': 'Login successful',
        'user': user.to_dict(),
        'access': access_token,
        'refresh': refresh_token
    }), 200


@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """User logout - blacklist the token"""
    jti = get_jwt()['jti']
    
    # Add token to blocklist
    token = TokenBlocklist(jti=jti)
    db.session.add(token)
    db.session.commit()
    
    return jsonify({'message': 'Successfully logged out'}), 200


@auth_bp.route('/token/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Refresh access token"""
    current_user = get_jwt_identity()
    access_token = create_access_token(identity=current_user)
    
    return jsonify({'access': access_token}), 200


@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def profile():
    """Get current user profile"""
    current_user_id = get_jwt_identity()
    user = User.query.get_or_404(current_user_id)
    
    return jsonify(user.to_dict()), 200
