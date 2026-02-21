from django.contrib import admin
from .models import Goal, Task, Progress


@admin.register(Goal)
class GoalAdmin(admin.ModelAdmin):
    list_display = ('title', 'user', 'level', 'time_per_day', 'deadline', 'created_at')
    list_filter = ('level', 'created_at')
    search_fields = ('title', 'user__username')
    date_hierarchy = 'created_at'


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('goal', 'day_number', 'topic', 'status', 'completed_at')
    list_filter = ('status', 'completed_at')
    search_fields = ('topic', 'goal__title')


@admin.register(Progress)
class ProgressAdmin(admin.ModelAdmin):
    list_display = ('goal', 'completion_percentage', 'streak', 'last_updated')
    readonly_fields = ('last_updated',)
