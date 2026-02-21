"""
Goals, Tasks, and Progress Routes for SkillPilot AI
Includes AI-powered roadmap generation
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Goal, Task, Progress, User
from services.ai_service import AIService
from services.progress_service import ProgressService
from datetime import datetime

goals_bp = Blueprint('goals', __name__, url_prefix='/api')


@goals_bp.route('/goals', methods=['GET'])
@jwt_required()
def list_goals():
    """
    List all goals for current user
    Supports pagination and filtering
    """
    current_user_id = get_jwt_identity()
    
    # Pagination
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    per_page = min(per_page, 100)  # Max 100 per page
    
    # Filtering
    sort_by = request.args.get('sort', 'created_at')  # created_at, title, level
    sort_order = request.args.get('order', 'desc')  # asc, desc
    
    query = Goal.query.filter_by(user_id=current_user_id)
    
    # Apply sorting
    if sort_by == 'title':
        query = query.order_by(Goal.title.asc() if sort_order == 'asc' else Goal.title.desc())
    elif sort_by == 'level':
        query = query.order_by(Goal.level.asc() if sort_order == 'asc' else Goal.level.desc())
    else:
        query = query.order_by(Goal.created_at.asc() if sort_order == 'asc' else Goal.created_at.desc())
    
    paginated = query.paginate(page=page, per_page=per_page)
    
    return jsonify({
        'results': [goal.to_dict(include_progress=True) for goal in paginated.items],
        'pagination': {
            'page': page,
            'per_page': per_page,
            'total': paginated.total,
            'pages': paginated.pages
        }
    }), 200


@goals_bp.route('/goals', methods=['POST'])
@jwt_required()
def create_goal():
    """
    Create a new goal with AI-generated roadmap
    
    Request body:
    {
        "title": "Learn React",
        "level": "beginner",
        "time_per_day": 60,
        "deadline": "2024-03-18",
        "description": "Master React basics"  (optional),
        "generate_ai": true  (optional, default: true)
    }
    
    Response: Goal with AI-generated tasks or fallback to default
    """
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validate input
    if not data or not data.get('title') or not data.get('level') or not data.get('time_per_day'):
        return jsonify({'error': 'Missing required fields: title, level, time_per_day'}), 400
    
    # Validate level
    if data['level'].lower() not in ['beginner', 'intermediate', 'advanced']:
        return jsonify({'error': 'Level must be beginner, intermediate, or advanced'}), 400
    
    # Parse deadline if provided
    deadline = None
    if data.get('deadline'):
        try:
            deadline = datetime.strptime(data['deadline'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Invalid deadline format. Use YYYY-MM-DD'}), 400
    
    # Create goal
    goal = Goal(
        user_id=current_user_id,
        title=data['title'],
        description=data.get('description', ''),
        level=data['level'].lower(),
        time_per_day=data['time_per_day'],
        deadline=deadline,
        roadmap_generated=False
    )
    
    db.session.add(goal)
    db.session.commit()
    
    # Try to generate AI roadmap
    should_generate_ai = data.get('generate_ai', True)
    
    if should_generate_ai:
        try:
            # Generate AI roadmap
            roadmap = AIService.generate_roadmap(
                goal.title,
                goal.level,
                30
            )
            
            # Create tasks from roadmap
            for item in roadmap:
                task = Task(
                    goal_id=goal.id,
                    day_number=item['day'],
                    topic=item['topic'],
                    description=f"Estimated time: {item.get('estimated_time', 45)} minutes",
                    status='pending'
                )
                db.session.add(task)
            
            goal.roadmap_generated = True
            db.session.commit()
        
        except Exception as e:
            print(f"AI roadmap generation failed, using default: {str(e)}")
            # Fall back to default tasks
            goal.create_default_tasks()
            goal.roadmap_generated = False
            db.session.commit()
    else:
        # Create default tasks
        goal.create_default_tasks()
    
    # Create progress tracker
    progress = Progress(goal_id=goal.id)
    db.session.add(progress)
    db.session.commit()
    
    # Update progress
    progress.update_completion()
    
    return jsonify({
        'message': 'Goal created successfully' + (' with AI-generated roadmap' if goal.roadmap_generated else ''),
        'goal': goal.to_dict(include_tasks=True, include_progress=True)
    }), 201



@goals_bp.route('/goals/<int:goal_id>', methods=['GET'])
@jwt_required()
def get_goal(goal_id):
    """Get a specific goal"""
    current_user_id = get_jwt_identity()
    goal = Goal.query.filter_by(id=goal_id, user_id=current_user_id).first_or_404()
    
    return jsonify(goal.to_dict(include_tasks=True, include_progress=True)), 200


@goals_bp.route('/goals/<int:goal_id>', methods=['DELETE'])
@jwt_required()
def delete_goal(goal_id):
    """Delete a goal"""
    current_user_id = get_jwt_identity()
    goal = Goal.query.filter_by(id=goal_id, user_id=current_user_id).first_or_404()
    
    db.session.delete(goal)
    db.session.commit()
    
    return jsonify({'message': 'Goal deleted successfully'}), 200


@goals_bp.route('/goals/<int:goal_id>/tasks', methods=['GET'])
@jwt_required()
def list_tasks(goal_id):
    """List all tasks for a goal"""
    current_user_id = get_jwt_identity()
    goal = Goal.query.filter_by(id=goal_id, user_id=current_user_id).first_or_404()
    
    return jsonify([task.to_dict() for task in goal.tasks]), 200


@goals_bp.route('/tasks/<int:task_id>/update-status', methods=['PATCH'])
@jwt_required()
def update_task_status(task_id):
    """Update task status (pending/completed)"""
    current_user_id = get_jwt_identity()
    task = Task.query.get_or_404(task_id)
    
    # Verify ownership
    if task.goal.user_id != current_user_id:
        return jsonify({'error': 'Unauthorized'}), 403
    
    data = request.get_json()
    status = data.get('status')
    
    if status not in ['pending', 'completed']:
        return jsonify({'error': 'Invalid status. Must be pending or completed'}), 400
    
    if status == 'completed':
        task.mark_complete()
    else:
        task.mark_pending()
    
    return jsonify(task.to_dict()), 200


@goals_bp.route('/goals/<int:goal_id>/progress', methods=['GET'])
@jwt_required()
def get_progress(goal_id):
    """Get progress for a goal"""
    current_user_id = get_jwt_identity()
    goal = Goal.query.filter_by(id=goal_id, user_id=current_user_id).first_or_404()
    
    if not goal.progress:
        # Create progress if doesn't exist
        progress = Progress(goal_id=goal.id)
        db.session.add(progress)
        db.session.commit()
        progress.update_completion()
    
    return jsonify(goal.progress.to_dict()), 200


@goals_bp.route('/dashboard', methods=['GET'])
@jwt_required()
def dashboard_stats():
    """Get dashboard statistics"""
    current_user_id = get_jwt_identity()
    goals = Goal.query.filter_by(user_id=current_user_id).all()
    
    total_goals = len(goals)
    total_tasks = sum(len(goal.tasks) for goal in goals)
    completed_tasks = sum(
        len([task for task in goal.tasks if task.status == 'completed'])
        for goal in goals
    )
    
    avg_completion = 0
    if total_goals > 0:
        avg_completion = sum(
            goal.progress.completion_percentage if goal.progress else 0
            for goal in goals
        ) / total_goals
    
    return jsonify({
        'total_goals': total_goals,
        'total_tasks': total_tasks,
        'completed_tasks': completed_tasks,
        'average_completion': round(avg_completion, 2)
    }), 200
