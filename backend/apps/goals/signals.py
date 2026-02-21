"""
Django signals for Goal model
"""
from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Goal, Progress

# Signals are already handled in the model's save method
# This file is kept for future signal-based logic if needed
