"""
Database models for Goals, Tasks, and Progress
"""
from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone


class Goal(models.Model):
    """
    User's learning goal
    """
    LEVEL_CHOICES = [
        ('Beginner', 'Beginner'),
        ('Intermediate', 'Intermediate'),
        ('Advanced', 'Advanced'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='goals')
    title = models.CharField(max_length=255)
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES)
    time_per_day = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(24)],
        help_text="Hours per day"
    )
    deadline = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'goals'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.user.username}"
    
    def save(self, *args, **kwargs):
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        # Auto-create tasks when goal is created
        if is_new:
            self.create_default_tasks()
            # Create progress tracker
            Progress.objects.create(goal=self)
    
    def create_default_tasks(self):
        """Generate 30 placeholder tasks"""
        tasks = []
        for day in range(1, 31):
            task = Task(
                goal=self,
                day_number=day,
                topic=f"Day {day}: Topic to be determined",
                status='pending'
            )
            tasks.append(task)
        Task.objects.bulk_create(tasks)


class Task(models.Model):
    """
    Daily task for a goal
    """
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('done', 'Done'),
    ]
    
    goal = models.ForeignKey(Goal, on_delete=models.CASCADE, related_name='tasks')
    day_number = models.IntegerField()
    topic = models.CharField(max_length=500)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        db_table = 'tasks'
        ordering = ['day_number']
        unique_together = ['goal', 'day_number']
    
    def __str__(self):
        return f"{self.goal.title} - Day {self.day_number}"
    
    def mark_complete(self):
        """Mark task as complete"""
        self.status = 'done'
        self.completed_at = timezone.now()
        self.save()
        
        # Update progress
        self.goal.progress.update_completion()
    
    def mark_pending(self):
        """Mark task as pending"""
        self.status = 'pending'
        self.completed_at = None
        self.save()
        
        # Update progress
        self.goal.progress.update_completion()


class Progress(models.Model):
    """
    Progress tracking for a goal
    """
    goal = models.OneToOneField(Goal, on_delete=models.CASCADE, related_name='progress')
    completion_percentage = models.FloatField(
        default=0.0,
        validators=[MinValueValidator(0.0), MaxValueValidator(100.0)]
    )
    streak = models.IntegerField(default=0)
    last_updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'progress'
    
    def __str__(self):
        return f"Progress for {self.goal.title}"
    
    def update_completion(self):
        """Calculate and update completion percentage"""
        total_tasks = self.goal.tasks.count()
        if total_tasks == 0:
            self.completion_percentage = 0.0
        else:
            completed_tasks = self.goal.tasks.filter(status='done').count()
            self.completion_percentage = round((completed_tasks / total_tasks) * 100, 2)
        
        # Update streak (consecutive completed days)
        self.update_streak()
        self.save()
    
    def update_streak(self):
        """Calculate current streak of completed tasks"""
        tasks = self.goal.tasks.order_by('day_number')
        streak = 0
        
        for task in tasks:
            if task.status == 'done':
                streak += 1
            else:
                break
        
        self.streak = streak
