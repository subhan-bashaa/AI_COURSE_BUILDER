"""
SkillPilot AI - Main URL Configuration
"""
from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # API endpoints
    path('api/', include('apps.accounts.urls')),
    path('api/', include('apps.goals.urls')),
    
    # JWT token refresh
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
