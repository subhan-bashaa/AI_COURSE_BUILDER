"""
API Views for Goals, Tasks, and Progress
"""
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404

from .models import Goal, Task, Progress
from .serializers import (
    GoalSerializer,
    GoalDetailSerializer,
    TaskSerializer,
    TaskStatusUpdateSerializer,
    ProgressSerializer
)


class GoalListCreateView(generics.ListCreateAPIView):
    """
    GET /api/goals/ - List all goals for authenticated user
    POST /api/goals/ - Create a new goal
    """
    serializer_class = GoalSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Only return goals for the authenticated user
        return Goal.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        # Automatically set the user to the authenticated user
        serializer.save(user=self.request.user)


class GoalDetailView(generics.RetrieveDestroyAPIView):
    """
    GET /api/goals/<id>/ - Get goal details with all tasks
    DELETE /api/goals/<id>/ - Delete a goal
    """
    serializer_class = GoalDetailSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Only allow access to user's own goals
        return Goal.objects.filter(user=self.request.user)
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({
            'message': 'Goal deleted successfully'
        }, status=status.HTTP_200_OK)


class GoalTasksListView(generics.ListAPIView):
    """
    GET /api/goals/<goal_id>/tasks/ - List all tasks for a specific goal
    """
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        goal_id = self.kwargs['goal_id']
        # Ensure the goal belongs to the authenticated user
        goal = get_object_or_404(Goal, id=goal_id, user=self.request.user)
        return Task.objects.filter(goal=goal)


class TaskStatusUpdateView(APIView):
    """
    PATCH /api/tasks/<id>/update-status/ - Update task status (pending/done)
    """
    permission_classes = [IsAuthenticated]
    
    def patch(self, request, pk):
        # Get task and ensure it belongs to user's goal
        task = get_object_or_404(
            Task,
            pk=pk,
            goal__user=request.user
        )
        
        serializer = TaskStatusUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        new_status = serializer.validated_data['status']
        
        if new_status == 'done':
            task.mark_complete()
        else:
            task.mark_pending()
        
        return Response({
            'message': 'Task status updated successfully',
            'task': TaskSerializer(task).data
        }, status=status.HTTP_200_OK)


class GoalProgressView(generics.RetrieveAPIView):
    """
    GET /api/goals/<goal_id>/progress/ - Get progress for a specific goal
    """
    serializer_class = ProgressSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        goal_id = self.kwargs['goal_id']
        goal = get_object_or_404(Goal, id=goal_id, user=self.request.user)
        
        # Get or create progress
        progress, created = Progress.objects.get_or_create(goal=goal)
        if created or progress.completion_percentage == 0:
            progress.update_completion()
        
        return progress


class DashboardStatsView(APIView):
    """
    GET /api/dashboard/ - Get dashboard statistics for the user
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        goals = Goal.objects.filter(user=user)
        
        total_goals = goals.count()
        total_tasks = Task.objects.filter(goal__user=user).count()
        completed_tasks = Task.objects.filter(goal__user=user, status='done').count()
        
        # Calculate overall completion
        overall_completion = 0
        if total_tasks > 0:
            overall_completion = round((completed_tasks / total_tasks) * 100, 2)
        
        # Get current streak (max streak from all goals)
        max_streak = 0
        for goal in goals:
            if hasattr(goal, 'progress'):
                if goal.progress.streak > max_streak:
                    max_streak = goal.progress.streak
        
        # Get today's tasks (first pending task from each goal)
        today_tasks = []
        for goal in goals:
            first_pending = goal.tasks.filter(status='pending').first()
            if first_pending:
                today_tasks.append(TaskSerializer(first_pending).data)
        
        return Response({
            'total_goals': total_goals,
            'total_tasks': total_tasks,
            'completed_tasks': completed_tasks,
            'overall_completion': overall_completion,
            'current_streak': max_streak,
            'today_tasks': today_tasks
        }, status=status.HTTP_200_OK)
