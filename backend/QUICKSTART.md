# SkillPilot AI - Flask Quick Start Guide

## 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

## 2. Setup Environment
```bash
copy .env.example .env
# Edit .env if needed (optional for SQLite)
```

## 3. Run Server
```bash
python app.py
```

Server: http://localhost:8000
Health Check: http://localhost:8000/health
API Base: http://localhost:8000/api

## API Endpoints
- POST /api/register - Register user
- POST /api/login - Login
- GET /api/profile - Get profile
- GET /api/goals - List goals
- POST /api/goals - Create goal
- GET /api/dashboard - Dashboard stats
