"""
Analytics Routes for SkillPilot AI
Provides detailed analytics and insights for goals
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Goal, Task
from services.progress_service import ProgressService
from datetime import datetime, timedelta

analytics_bp = Blueprint('analytics', __name__, url_prefix='/api')


@analytics_bp.route('/goals/<int:goal_id>/analytics', methods=['GET'])
@jwt_required()
def get_goal_analytics(goal_id):
    """Get detailed analytics for a goal"""
    current_user_id = get_jwt_identity()
    goal = Goal.query.filter_by(id=goal_id, user_id=current_user_id).first_or_404()
    
    analytics = ProgressService.get_analytics_data(goal_id)
    
    return jsonify(analytics), 200


@analytics_bp.route('/goals/<int:goal_id>/insights', methods=['GET'])
@jwt_required()
def get_goal_insights(goal_id):
    """Get intelligent insights for a goal"""
    current_user_id = get_jwt_identity()
    goal = Goal.query.filter_by(id=goal_id, user_id=current_user_id).first_or_404()
    
    # Catchup plan
    catchup_plan = ProgressService.suggest_catch_up_plan(goal_id)
    
    # Missed days
    missed_days = ProgressService.detect_missed_days(goal_id)
    
    # Daily reminder
    daily_reminder = ProgressService.get_daily_reminder(goal_id)
    
    # Calculate velocity (tasks completed per day)
    today = datetime.utcnow().date()
    start_date = goal.created_at.date()
    days_elapsed = max(1, (today - start_date).days)
    
    completed_tasks = sum(1 for t in goal.tasks if t.status == 'completed')
    velocity = completed_tasks / days_elapsed
    
    return jsonify({
        'goal_id': goal_id,
        'goal_title': goal.title,
        'catchup_plan': catchup_plan,
        'missed_days': len(missed_days),
        'missed_tasks': missed_days,
        'daily_reminder': daily_reminder,
        'velocity': {
            'tasks_per_day': round(velocity, 2),
            'days_elapsed': days_elapsed,
            'estimated_completion_days': round(len(goal.tasks) / velocity) if velocity > 0 else None
        },
        'recommendations': ProgressService._generate_recommendations(goal_id)
    }), 200


@analytics_bp.route('/goals/<int:goal_id>/weekly-progress', methods=['GET'])
@jwt_required()
def get_weekly_progress(goal_id):
    """Get weekly progress breakdown for charting"""
    current_user_id = get_jwt_identity()
    goal = Goal.query.filter_by(id=goal_id, user_id=current_user_id).first_or_404()
    
    # Get last 8 weeks
    today = datetime.utcnow().date()
    weekly_data = []
    
    for week_offset in range(8, -1, -1):  # Last 8 weeks
        week_start = today - timedelta(days=today.weekday() + 7 * week_offset)
        week_end = week_start + timedelta(days=6)
        
        completed = sum(
            1 for t in goal.tasks
            if t.completed_at and
            week_start <= t.completed_at.date() <= week_end and
            t.status == 'completed'
        )
        
        weekly_data.append({
            'week_start': week_start.isoformat(),
            'week_end': week_end.isoformat(),
            'completed': completed,
            'week_number': week_start.isocalendar()[1]
        })
    
    return jsonify({
        'goal_id': goal_id,
        'weekly_data': weekly_data
    }), 200


@analytics_bp.route('/goals/<int:goal_id>/daily-breakdown', methods=['GET'])
@jwt_required()
def get_daily_breakdown(goal_id):
    """Get daily completion breakdown"""
    current_user_id = get_jwt_identity()
    goal = Goal.query.filter_by(id=goal_id, user_id=current_user_id).first_or_404()
    
    daily_data = []
    
    for task in sorted(goal.tasks, key=lambda t: t.day_number):
        daily_data.append({
            'day': task.day_number,
            'topic': task.topic,
            'status': task.status,
            'completed_at': task.completed_at.isoformat() if task.completed_at else None
        })
    
    return jsonify({
        'goal_id': goal_id,
        'daily_data': daily_data
    }), 200


@analytics_bp.route('/goals/<int:goal_id>/comparison', methods=['GET'])
@jwt_required()
def get_comparison_analytics(goal_id):
    """Compare this goal with user's average"""
    current_user_id = get_jwt_identity()
    goal = Goal.query.filter_by(id=goal_id, user_id=current_user_id).first_or_404()
    user = goal.user
    
    # Calculate user average
    user_goals = user.goals
    if len(user_goals) > 1:
        avg_completion = sum(
            g.progress.completion_percentage for g in user_goals if g.progress
        ) / len(user_goals)
        avg_streak = sum(
            g.progress.streak for g in user_goals if g.progress
        ) / len(user_goals)
    else:
        avg_completion = 0
        avg_streak = 0
    
    goal_completion = goal.progress.completion_percentage if goal.progress else 0
    goal_streak = goal.progress.streak if goal.progress else 0
    
    return jsonify({
        'goal_id': goal_id,
        'goal_stats': {
            'completion_percentage': round(goal_completion, 2),
            'current_streak': goal_streak
        },
        'user_average': {
            'avg_completion_percentage': round(avg_completion, 2),
            'avg_streak': round(avg_streak, 2)
        },
        'comparison': {
            'completion_difference': round(goal_completion - avg_completion, 2),
            'streak_difference': goal_streak - round(avg_streak)
        }
    }), 200


@analytics_bp.route('/dashboard/overview', methods=['GET'])
@jwt_required()
def get_dashboard_overview():
    """Get dashboard overview with all stats"""
    current_user_id = get_jwt_identity()
    
    from models import User
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    goals = user.goals
    
    # Aggregate statistics
    total_goals = len(goals)
    total_tasks = sum(len(g.tasks) for g in goals)
    completed_tasks = sum(
        len([t for t in g.tasks if t.status == 'completed'])
        for g in goals
    )
    
    total_completion = 0
    total_streak = 0
    
    for goal in goals:
        if goal.progress:
            total_completion += goal.progress.completion_percentage
            total_streak = max(total_streak, goal.progress.streak)
    
    avg_completion = total_completion / total_goals if total_goals > 0 else 0
    
    return jsonify({
        'user': user.to_dict(),
        'overview': {
            'total_goals': total_goals,
            'total_tasks': total_tasks,
            'completed_tasks': completed_tasks,
            'average_completion_percentage': round(avg_completion, 2),
            'best_streak': total_streak
        },
        'recent_goals': [g.to_dict(include_progress=True) for g in sorted(goals, key=lambda g: g.created_at, reverse=True)[:5]]
    }), 200


# Helper function to generate recommendations
def _generate_recommendations(goal_id):
    """Generate personalized recommendations"""
    goal = Goal.query.get(goal_id)
    if not goal:
        return []
    
    recommendations = []
    
    if not goal.progress:
        return recommendations
    
    # Check completion
    if goal.progress.completion_percentage < 50:
        recommendations.append({
            'type': 'urgency',
            'message': 'You\'re less than 50% complete. It\'s time to pick up the pace!',
            'action': 'Complete at least 5 tasks today'
        })
    
    # Check streak
    if goal.progress.streak == 0:
        recommendations.append({
            'type': 'motivation',
            'message': 'Start a streak by completing today\'s task!',
            'action': 'Complete today\'s task'
        })
    elif goal.progress.streak > 7:
        recommendations.append({
            'type': 'celebration',
            'message': f'Amazing! You have a {goal.progress.streak}-day streak!',
            'action': 'Keep it going!'
        })
    
    # Check deadline
    if goal.deadline:
        days_left = (goal.deadline - datetime.utcnow().date()).days
        if days_left < 7 and days_left > 0:
            recommendations.append({
                'type': 'deadline_warning',
                'message': f'Only {days_left} days left to finish this goal!',
                'action': 'Accelerate your progress'
            })
    
    return recommendations


# Patch the method into ProgressService
ProgressService._generate_recommendations = staticmethod(_generate_recommendations)
