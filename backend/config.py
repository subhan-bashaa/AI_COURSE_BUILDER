"""
Flask Configuration for SkillPilot AI Backend
"""
import os
from datetime import timedelta
from decouple import config

class Config:
    """Base configuration"""
    
    # Security
    SECRET_KEY = config('SECRET_KEY', default='flask-secret-key-change-in-production')
    
    # Database
    SQLALCHEMY_DATABASE_URI = config(
        'DATABASE_URL',
        default='sqlite:///skillpilot.db'
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # JWT Configuration
    JWT_SECRET_KEY = config('JWT_SECRET_KEY', default=SECRET_KEY)
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=7)
    JWT_BLACKLIST_ENABLED = True
    JWT_BLACKLIST_TOKEN_CHECKS = ['access', 'refresh']
    
    # CORS
    CORS_ORIGINS = config(
        'CORS_ORIGINS',
        default='http://localhost:5173,http://localhost:5174,http://localhost:5175,http://localhost:5176,http://localhost:5177'
    ).split(',')


class DevelopmentConfig(Config):
    """Development configuration"""
    DEBUG = True


class ProductionConfig(Config):
    """Production configuration"""
    DEBUG = False


config_dict = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}
