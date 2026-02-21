"""
SQLAlchemy Models for SkillPilot AI
Production-ready models with full tracking
"""
from datetime import datetime, date, timedelta
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()


class User(db.Model):
    """User model for authentication with profile support"""
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    profile_picture_url = db.Column(db.String(500), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    goals = db.relationship('Goal', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def set_password(self, password):
        """Hash and set password"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Verify password"""
        return check_password_hash(self.password_hash, password)
    
    def get_total_completed_tasks(self):
        """Calculate total completed tasks across all goals"""
        total = 0
        for goal in self.goals:
            total += sum(1 for task in goal.tasks if task.status == 'completed')
        return total
    
    def to_dict(self, include_stats=False):
        """Serialize user to dictionary"""
        data = {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'profile_picture_url': self.profile_picture_url,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
        
        if include_stats:
            data['total_goals'] = len(self.goals)
            data['total_completed_tasks'] = self.get_total_completed_tasks()
        
        return data


class Goal(db.Model):
    """Learning goal model - user-specific"""
    __tablename__ = 'goals'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    level = db.Column(db.String(50), nullable=False)  # beginner, intermediate, advanced
    time_per_day = db.Column(db.Integer, nullable=False)  # minutes
    deadline = db.Column(db.Date, nullable=True)
    roadmap_generated = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    tasks = db.relationship('Task', backref='goal', lazy=True, cascade='all, delete-orphan')
    progress = db.relationship('Progress', backref='goal', uselist=False, cascade='all, delete-orphan')
    
    def create_default_tasks(self):
        """Create 30 placeholder tasks for 30-day roadmap"""
        for day in range(1, 31):
            task = Task(
                goal_id=self.id,
                day_number=day,
                topic=f"Day {day}: Learning Module",
                status='pending'
            )
            db.session.add(task)
        db.session.commit()
    
    def to_dict(self, include_tasks=False, include_progress=False):
        """Serialize goal to dictionary"""
        data = {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'description': self.description,
            'level': self.level,
            'time_per_day': self.time_per_day,
            'deadline': self.deadline.isoformat() if self.deadline else None,
            'roadmap_generated': self.roadmap_generated,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
        
        if include_tasks:
            data['tasks'] = [task.to_dict() for task in self.tasks]
        
        if include_progress and self.progress:
            data['progress'] = self.progress.to_dict()
        
        return data



class Task(db.Model):
    """Daily task model"""
    __tablename__ = 'tasks'
    
    id = db.Column(db.Integer, primary_key=True)
    goal_id = db.Column(db.Integer, db.ForeignKey('goals.id'), nullable=False)
    day_number = db.Column(db.Integer, nullable=False)
    topic = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(20), default='pending')  # pending, completed
    completed_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def mark_complete(self):
        """Mark task as completed and update progress"""
        self.status = 'completed'
        self.completed_at = datetime.utcnow()
        db.session.commit()
        
        # Update progress
        if self.goal.progress:
            self.goal.progress.update_completion()
    
    def mark_pending(self):
        """Mark task as pending"""
        self.status = 'pending'
        self.completed_at = None
        db.session.commit()
        
        # Update progress
        if self.goal.progress:
            self.goal.progress.update_completion()
    
    def to_dict(self):
        """Serialize task to dictionary"""
        return {
            'id': self.id,
            'goal_id': self.goal_id,
            'day_number': self.day_number,
            'topic': self.topic,
            'description': self.description,
            'status': self.status,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Progress(db.Model):
    """Progress tracking model with smart streak calculation"""
    __tablename__ = 'progress'
    
    id = db.Column(db.Integer, primary_key=True)
    goal_id = db.Column(db.Integer, db.ForeignKey('goals.id'), unique=True, nullable=False)
    completion_percentage = db.Column(db.Float, default=0.0)
    streak = db.Column(db.Integer, default=0)
    longest_streak = db.Column(db.Integer, default=0)
    last_completion_date = db.Column(db.Date, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def update_completion(self):
        """Calculate completion percentage with proper streak logic"""
        goal = self.goal
        total_tasks = len(goal.tasks)
        
        if total_tasks > 0:
            completed_tasks = sum(1 for task in goal.tasks if task.status == 'completed')
            self.completion_percentage = (completed_tasks / total_tasks) * 100
        
        # Smart streak calculation
        self._calculate_streak()
        
        self.updated_at = datetime.utcnow()
        db.session.commit()
    
    def _calculate_streak(self):
        """Calculate consecutive days streak with missed day detection"""
        goal = self.goal
        sorted_tasks = sorted(goal.tasks, key=lambda t: t.day_number)
        
        current_streak = 0
        max_streak = 0
        
        for task in sorted_tasks:
            if task.status == 'completed':
                current_streak += 1
                if current_streak > max_streak:
                    max_streak = current_streak
                self.last_completion_date = task.completed_at.date() if task.completed_at else None
            else:
                current_streak = 0
        
        self.streak = current_streak
        self.longest_streak = max(self.longest_streak, max_streak)
    
    def to_dict(self):
        """Serialize progress to dictionary"""
        return {
            'id': self.id,
            'goal_id': self.goal_id,
            'completion_percentage': round(self.completion_percentage, 2),
            'streak': self.streak,
            'longest_streak': self.longest_streak,
            'last_completion_date': self.last_completion_date.isoformat() if self.last_completion_date else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class TokenBlocklist(db.Model):
    """Store blacklisted JWT tokens for logout"""
    __tablename__ = 'token_blocklist'
    
    id = db.Column(db.Integer, primary_key=True)
    jti = db.Column(db.String(36), nullable=False, unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class ConversationMessage(db.Model):
    """Store AI chat conversation history"""
    __tablename__ = 'conversation_messages'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    role = db.Column(db.String(20), nullable=False)  # 'user' or 'assistant'
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'role': self.role,
            'content': self.content,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class LessonContent(db.Model):
    """Detailed lesson content for each daily task"""
    __tablename__ = 'lesson_contents'
    
    id = db.Column(db.Integer, primary_key=True)
    task_id = db.Column(db.Integer, db.ForeignKey('tasks.id'), unique=True, nullable=False)
    explanation = db.Column(db.Text, nullable=False)  # AI-generated detailed explanation
    key_concepts = db.Column(db.JSON, nullable=True)  # Array of key concepts
    example_code = db.Column(db.Text, nullable=True)  # Example code snippet
    programming_language = db.Column(db.String(50), nullable=True)  # python, javascript, etc.
    difficulty_notes = db.Column(db.Text, nullable=True)
    estimated_time = db.Column(db.Integer, default=30)  # minutes
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    task = db.relationship('Task', backref=db.backref('lesson_content', uselist=False))
    resources = db.relationship('LearningResource', backref='lesson', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self, include_resources=True):
        data = {
            'id': self.id,
            'task_id': self.task_id,
            'explanation': self.explanation,
            'key_concepts': self.key_concepts or [],
            'example_code': self.example_code,
            'programming_language': self.programming_language,
            'difficulty_notes': self.difficulty_notes,
            'estimated_time': self.estimated_time,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
        
        if include_resources:
            data['resources'] = [resource.to_dict() for resource in self.resources]
        
        return data


class LearningResource(db.Model):
    """Learning resources (videos, articles, docs) for each lesson"""
    __tablename__ = 'learning_resources'
    
    id = db.Column(db.Integer, primary_key=True)
    lesson_id = db.Column(db.Integer, db.ForeignKey('lesson_contents.id'), nullable=False)
    resource_type = db.Column(db.String(50), nullable=False)  # video, article, documentation, exercise
    title = db.Column(db.String(255), nullable=False)
    url = db.Column(db.String(500), nullable=False)
    description = db.Column(db.Text, nullable=True)
    duration = db.Column(db.Integer, nullable=True)  # For videos, in minutes
    thumbnail_url = db.Column(db.String(500), nullable=True)
    provider = db.Column(db.String(50), nullable=True)  # youtube, medium, etc.
    recommended_order = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'resource_type': self.resource_type,
            'title': self.title,
            'url': self.url,
            'description': self.description,
            'duration': self.duration,
            'thumbnail_url': self.thumbnail_url,
            'provider': self.provider,
            'recommended_order': self.recommended_order
        }


class Quiz(db.Model):
    """Quiz questions for each task/lesson"""
    __tablename__ = 'quizzes'
    
    id = db.Column(db.Integer, primary_key=True)
    task_id = db.Column(db.Integer, db.ForeignKey('tasks.id'), nullable=False)
    question = db.Column(db.Text, nullable=False)
    question_type = db.Column(db.String(20), default='multiple_choice')  # multiple_choice, code, true_false
    options = db.Column(db.JSON, nullable=True)  # Array of options for multiple choice
    correct_answer = db.Column(db.String(500), nullable=False)
    explanation = db.Column(db.Text, nullable=True)  # Explanation of correct answer
    difficulty = db.Column(db.String(20), default='medium')  # easy, medium, hard
    points = db.Column(db.Integer, default=1)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    task = db.relationship('Task', backref='quizzes')
    
    def to_dict(self, include_answer=False):
        data = {
            'id': self.id,
            'task_id': self.task_id,
            'question': self.question,
            'question_type': self.question_type,
            'options': self.options or [],
            'difficulty': self.difficulty,
            'points': self.points
        }
        
        if include_answer:
            data['correct_answer'] = self.correct_answer
            data['explanation'] = self.explanation
        
        return data


class QuizAttempt(db.Model):
    """Track user's quiz attempts and scores"""
    __tablename__ = 'quiz_attempts'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    task_id = db.Column(db.Integer, db.ForeignKey('tasks.id'), nullable=False)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quizzes.id'), nullable=False)
    user_answer = db.Column(db.String(500), nullable=False)
    is_correct = db.Column(db.Boolean, nullable=False)
    time_taken = db.Column(db.Integer, nullable=True)  # seconds
    attempted_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref='quiz_attempts')
    task = db.relationship('Task', backref='quiz_attempts')
    quiz = db.relationship('Quiz', backref='attempts')
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'task_id': self.task_id,
            'quiz_id': self.quiz_id,
            'user_answer': self.user_answer,
            'is_correct': self.is_correct,
            'time_taken': self.time_taken,
            'attempted_at': self.attempted_at.isoformat() if self.attempted_at else None
        }


class Assessment(db.Model):
    """Store performance analytics and suggestions for each task"""
    __tablename__ = 'assessments'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    task_id = db.Column(db.Integer, db.ForeignKey('tasks.id'), nullable=False)
    goal_id = db.Column(db.Integer, db.ForeignKey('goals.id'), nullable=False)
    score_percentage = db.Column(db.Float, default=0.0)
    total_questions = db.Column(db.Integer, nullable=False)
    correct_answers = db.Column(db.Integer, nullable=False)
    time_spent = db.Column(db.Integer, nullable=True)  # Total time in minutes
    weak_areas = db.Column(db.JSON, nullable=True)  # Array of weak concepts
    strengths = db.Column(db.JSON, nullable=True)  # Array of strong areas
    ai_suggestions = db.Column(db.JSON, nullable=True)  # AI-generated improvement suggestions
    completed_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relationships
    user = db.relationship('User', backref='assessments')
    task = db.relationship('Task', backref='assessments')
    goal = db.relationship('Goal', backref='assessments')
    
    def calculate_score(self):
        """Calculate score percentage"""
        if self.total_questions > 0:
            self.score_percentage = (self.correct_answers / self.total_questions) * 100
        return self.score_percentage
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'task_id': self.task_id,
            'goal_id': self.goal_id,
            'score_percentage': round(self.score_percentage, 2),
            'total_questions': self.total_questions,
            'correct_answers': self.correct_answers,
            'time_spent': self.time_spent,
            'weak_areas': self.weak_areas or [],
            'strengths': self.strengths or [],
            'ai_suggestions': self.ai_suggestions or [],
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }

