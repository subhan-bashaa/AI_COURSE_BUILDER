"""
Serializers for Goal, Task, and Progress models
"""
from rest_framework import serializers
from .models import Goal, Task, Progress


class TaskSerializer(serializers.ModelSerializer):
    """Serializer for Task model"""
    
    class Meta:
        model = Task
        fields = [
            'id',
            'goal',
            'day_number',
            'topic',
            'status',
            'completed_at'
        ]
        read_only_fields = ['id', 'goal', 'completed_at']


class ProgressSerializer(serializers.ModelSerializer):
    """Serializer for Progress model"""
    
    class Meta:
        model = Progress
        fields = [
            'id',
            'goal',
            'completion_percentage',
            'streak',
            'last_updated'
        ]
        read_only_fields = ['id', 'goal', 'completion_percentage', 'streak', 'last_updated']


class GoalSerializer(serializers.ModelSerializer):
    """Serializer for Goal model"""
    user = serializers.StringRelatedField(read_only=True)
    tasks_count = serializers.SerializerMethodField()
    completed_tasks_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Goal
        fields = [
            'id',
            'user',
            'title',
            'level',
            'time_per_day',
            'deadline',
            'created_at',
            'tasks_count',
            'completed_tasks_count'
        ]
        read_only_fields = ['id', 'user', 'created_at']
    
    def get_tasks_count(self, obj):
        return obj.tasks.count()
    
    def get_completed_tasks_count(self, obj):
        return obj.tasks.filter(status='done').count()
    
    def validate_deadline(self, value):
        """Ensure deadline is in the future"""
        from django.utils import timezone
        if value < timezone.now().date():
            raise serializers.ValidationError("Deadline must be in the future.")
        return value


class GoalDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for Goal with all tasks"""
    user = serializers.StringRelatedField(read_only=True)
    tasks = TaskSerializer(many=True, read_only=True)
    progress = ProgressSerializer(read_only=True)
    
    class Meta:
        model = Goal
        fields = [
            'id',
            'user',
            'title',
            'level',
            'time_per_day',
            'deadline',
            'created_at',
            'tasks',
            'progress'
        ]
        read_only_fields = ['id', 'user', 'created_at']


class TaskStatusUpdateSerializer(serializers.Serializer):
    """Serializer for updating task status"""
    status = serializers.ChoiceField(choices=['pending', 'done'])
    
    def validate_status(self, value):
        if value not in ['pending', 'done']:
            raise serializers.ValidationError("Status must be 'pending' or 'done'.")
        return value
