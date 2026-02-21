"""
Profile Routes for SkillPilot AI
Handles user profile management and avatar uploads
"""
import os
from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from models import db, User

profile_bp = Blueprint('profile', __name__, url_prefix='/api')

# Configuration
UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

# Create upload folder if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@profile_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    """Get current user's profile"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify(user.to_dict(include_stats=True)), 200


@profile_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update user profile information"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    data = request.get_json()
    
    # Update allowed fields
    if 'username' in data:
        # Check if new username is available
        if data['username'] != user.username:
            if User.query.filter_by(username=data['username']).first():
                return jsonify({'error': 'Username already exists'}), 400
        user.username = data['username']
    
    if 'email' in data:
        # Check if new email is available
        if data['email'] != user.email:
            if User.query.filter_by(email=data['email']).first():
                return jsonify({'error': 'Email already exists'}), 400
        user.email = data['email']
    
    user.updated_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify({
        'message': 'Profile updated successfully',
        'user': user.to_dict(include_stats=True)
    }), 200


@profile_bp.route('/profile/upload-avatar', methods=['POST'])
@jwt_required()
def upload_avatar():
    """Upload user avatar image"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Check if file is in request
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if not allowed_file(file.filename):
        return jsonify({
            'error': f'Invalid file type. Allowed types: {", ".join(ALLOWED_EXTENSIONS)}'
        }), 400
    
    # Check file size
    file.seek(0, os.SEEK_END)
    if file.tell() > MAX_FILE_SIZE:
        return jsonify({'error': f'File size exceeds {MAX_FILE_SIZE // (1024 * 1024)}MB limit'}), 400
    file.seek(0)
    
    try:
        # Generate safe filename with timestamp
        extension = file.filename.rsplit('.', 1)[1].lower()
        filename = f"avatar_{user.id}_{datetime.utcnow().timestamp()}.{extension}"
        safe_filename = secure_filename(filename)
        
        # Save file
        filepath = os.path.join(UPLOAD_FOLDER, safe_filename)
        file.save(filepath)
        
        # Update user's profile picture URL
        profile_picture_url = f"/uploads/{safe_filename}"
        user.profile_picture_url = profile_picture_url
        user.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify({
            'message': 'Avatar uploaded successfully',
            'profile_picture_url': profile_picture_url,
            'user': user.to_dict(include_stats=True)
        }), 200
    
    except Exception as e:
        return jsonify({'error': f'Upload failed: {str(e)}'}), 500


@profile_bp.route('/profile/stats', methods=['GET'])
@jwt_required()
def get_profile_stats():
    """Get comprehensive profile statistics"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Calculate stats
    total_goals = len(user.goals)
    total_tasks = sum(len(goal.tasks) for goal in user.goals)
    total_completed = sum(
        len([t for t in goal.tasks if t.status == 'completed'])
        for goal in user.goals
    )
    
    # Calculate average completion
    avg_completion = 0
    if total_goals > 0:
        total_completion = sum(
            len([t for t in goal.tasks if t.status == 'completed']) / len(goal.tasks) * 100
            for goal in user.goals if goal.tasks
        )
        avg_completion = total_completion / total_goals
    
    # Get current streaks across all goals
    max_current_streak = 0
    max_overall_streak = 0
    for goal in user.goals:
        if goal.progress:
            max_current_streak = max(max_current_streak, goal.progress.streak)
            max_overall_streak = max(max_overall_streak, goal.progress.longest_streak)
    
    return jsonify({
        'user': user.to_dict(),
        'statistics': {
            'total_goals': total_goals,
            'total_tasks': total_tasks,
            'total_completed_tasks': total_completed,
            'average_completion_percentage': round(avg_completion, 2),
            'current_streak': max_current_streak,
            'longest_streak': max_overall_streak,
            'account_age_days': (datetime.utcnow() - user.created_at).days
        }
    }), 200


@profile_bp.route('/profile/delete-avatar', methods=['POST'])
@jwt_required()
def delete_avatar():
    """Delete user avatar"""
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    if user.profile_picture_url:
        try:
            # Delete file from disk
            filepath = os.path.join(UPLOAD_FOLDER, user.profile_picture_url.split('/')[-1])
            if os.path.exists(filepath):
                os.remove(filepath)
            
            # Update user
            user.profile_picture_url = None
            user.updated_at = datetime.utcnow()
            db.session.commit()
            
            return jsonify({'message': 'Avatar deleted successfully'}), 200
        except Exception as e:
            return jsonify({'error': f'Delete failed: {str(e)}'}), 500
    
    return jsonify({'message': 'No avatar to delete'}), 200
