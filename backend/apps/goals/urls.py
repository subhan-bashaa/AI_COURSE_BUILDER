"""
URL Configuration for goals app
"""
from django.urls import path
from .views import (
    GoalListCreateView,
    GoalDetailView,
    GoalTasksListView,
    TaskStatusUpdateView,
    GoalProgressView,
    DashboardStatsView
)

urlpatterns = [
    # Goals
    path('goals/', GoalListCreateView.as_view(), name='goal-list-create'),
    path('goals/<int:pk>/', GoalDetailView.as_view(), name='goal-detail'),
    
    # Tasks
    path('goals/<int:goal_id>/tasks/', GoalTasksListView.as_view(), name='goal-tasks'),
    path('tasks/<int:pk>/update-status/', TaskStatusUpdateView.as_view(), name='task-update-status'),
    
    # Progress
    path('goals/<int:goal_id>/progress/', GoalProgressView.as_view(), name='goal-progress'),
    
    # Dashboard
    path('dashboard/', DashboardStatsView.as_view(), name='dashboard-stats'),
]
