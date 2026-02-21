"""
Progress Service for SkillPilot AI
Handles all progress calculations, streak logic, and insights
"""
from datetime import datetime, timedelta
from models import Progress, Task, Goal


class ProgressService:
    """Service for progress and streak calculations"""
    
    @staticmethod
    def calculate_completion_percentage(goal_id):
        """
        Calculate completion percentage from database
        completion_percentage = completed_tasks / total_tasks * 100
        """
        goal = Goal.query.get(goal_id)
        if not goal:
            return 0.0
        
        total_tasks = len(goal.tasks)
        if total_tasks == 0:
            return 0.0
        
        completed_tasks = sum(1 for task in goal.tasks if task.status == 'completed')
        return (completed_tasks / total_tasks) * 100
    
    @staticmethod
    def calculate_streak(goal_id):
        """
        Calculate streak:
        - If task completed today and yesterday also completed → increment
        - If missed day → reset
        - Return: (current_streak, longest_streak)
        """
        goal = Goal.query.get(goal_id)
        if not goal:
            return 0, 0
        
        sorted_tasks = sorted(goal.tasks, key=lambda t: t.day_number)
        current_streak = 0
        max_streak = 0
        
        for task in sorted_tasks:
            if task.status == 'completed':
                current_streak += 1
                max_streak = max(max_streak, current_streak)
            else:
                current_streak = 0
        
        return current_streak, max_streak
    
    @staticmethod
    def detect_missed_days(goal_id):
        """Detect if user has missed completing daily tasks"""
        goal = Goal.query.get(goal_id)
        if not goal:
            return []
        
        today = datetime.utcnow().date()
        missed_days = []
        
        sorted_tasks = sorted(goal.tasks, key=lambda t: t.day_number)
        
        for i, task in enumerate(sorted_tasks):
            expected_date = goal.created_at.date() + timedelta(days=task.day_number - 1)
            
            if expected_date <= today and task.status == 'pending':
                missed_days.append({
                    'day_number': task.day_number,
                    'topic': task.topic,
                    'expected_date': expected_date.isoformat()
                })
        
        return missed_days
    
    @staticmethod
    def suggest_catch_up_plan(goal_id):
        """Generate a catch-up plan for missed tasks"""
        missed_days = ProgressService.detect_missed_days(goal_id)
        
        if not missed_days:
            return {
                'needs_catchup': False,
                'message': 'Great! You are on track.',
                'plan': []
            }
        
        # Suggest catching up missed tasks
        today = datetime.utcnow().date()
        plan = []
        
        for i, missed in enumerate(missed_days[:3]):  # Show max 3 catch-up tasks
            if i == 0:
                suggestion = f"Complete today: {missed['topic']}"
            else:
                suggestion = f"Complete in {i} days: {missed['topic']}"
            
            plan.append({
                'day': missed['day_number'],
                'topic': missed['topic'],
                'priority': 'high' if i == 0 else 'medium',
                'suggestion': suggestion
            })
        
        return {
            'needs_catchup': len(missed_days) > 0,
            'message': f'You have {len(missed_days)} task(s) to catch up on',
            'missed_count': len(missed_days),
            'plan': plan
        }
    
    @staticmethod
    def get_analytics_data(goal_id):
        """
        Get comprehensive analytics for a goal
        Returns: completion_percentage, streak, completed_tasks, pending_tasks, weekly_progress
        """
        goal = Goal.query.get(goal_id)
        if not goal:
            return None
        
        progress = goal.progress
        if not progress:
            # Create if doesn't exist
            from models import db
            progress = Progress(goal_id=goal_id)
            db.session.add(progress)
            db.session.commit()
        
        tasks = goal.tasks
        completed_tasks = sum(1 for t in tasks if t.status == 'completed')
        pending_tasks = len(tasks) - completed_tasks
        
        # Calculate weekly progress (progress over last 7 days)
        today = datetime.utcnow().date()
        week_ago = today - timedelta(days=7)
        
        weekly_completed = sum(1 for t in tasks if t.completed_at and 
                             week_ago <= t.completed_at.date() <= today and 
                             t.status == 'completed')
        
        current_streak, longest_streak = ProgressService.calculate_streak(goal_id)
        
        return {
            'completion_percentage': round(progress.completion_percentage, 2),
            'current_streak': current_streak,
            'longest_streak': longest_streak,
            'completed_tasks': completed_tasks,
            'pending_tasks': pending_tasks,
            'total_tasks': len(tasks),
            'weekly_completed': weekly_completed,
            'goal_title': goal.title,
            'goal_level': goal.level,
            'days_remaining': ProgressService._calculate_days_remaining(goal),
            'current_pace': ProgressService._calculate_pace(goal)
        }
    
    @staticmethod
    def _calculate_days_remaining(goal):
        """Calculate days remaining to complete the goal"""
        if not goal.deadline:
            return None
        
        today = datetime.utcnow().date()
        remaining = (goal.deadline - today).days
        return max(0, remaining)
    
    @staticmethod
    def _calculate_pace(goal):
        """Calculate if user is on pace to complete goal"""
        if not goal.deadline or not goal.tasks:
            return 'on-track'
        
        today = datetime.utcnow().date()
        total_days = (goal.deadline - goal.created_at.date()).days
        days_elapsed = (today - goal.created_at.date()).days
        
        if total_days == 0:
            return 'on-track'
        
        progress = goal.progress
        expected_progress = (days_elapsed / total_days) * 100
        actual_progress = progress.completion_percentage if progress else 0
        
        if actual_progress >= expected_progress:
            return 'ahead'
        elif actual_progress >= expected_progress * 0.8:
            return 'on-track'
        else:
            return 'behind'
    
    @staticmethod
    def get_daily_reminder(goal_id):
        """Check if user should get a daily reminder"""
        goal = Goal.query.get(goal_id)
        if not goal:
            return None
        
        today = datetime.utcnow().date()
        
        # Find today's task (assuming 30-day plan starting from goal creation)
        days_since_start = (today - goal.created_at.date()).days
        day_number = days_since_start + 1
        
        if day_number > 30:
            return None  # Goal period is over
        
        task = next((t for t in goal.tasks if t.day_number == day_number), None)
        
        if task and task.status == 'pending':
            return {
                'should_remind': True,
                'day_number': day_number,
                'topic': task.topic,
                'description': task.description,
                'time_required': goal.time_per_day
            }
        
        return {'should_remind': False}
