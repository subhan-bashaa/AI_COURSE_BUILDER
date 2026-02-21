# API Testing Guide

Test all endpoints with curl or Postman.

## 1. Register User
```bash
curl -X POST http://localhost:8000/api/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestPass123!",
    "password2": "TestPass123!",
    "first_name": "Test",
    "last_name": "User"
  }'
```

## 2. Login
```bash
curl -X POST http://localhost:8000/api/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "TestPass123!"
  }'
```

**Save the access token from response!**

## 3. Get Profile
```bash
curl -X GET http://localhost:8000/api/profile/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 4. Create Goal
```bash
curl -X POST http://localhost:8000/api/goals/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Master Python",
    "level": "Intermediate",
    "time_per_day": 3,
    "deadline": "2026-12-31"
  }'
```

## 5. List Goals
```bash
curl -X GET http://localhost:8000/api/goals/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 6. Get Goal Details (with tasks)
```bash
curl -X GET http://localhost:8000/api/goals/1/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 7. Get Goal Tasks
```bash
curl -X GET http://localhost:8000/api/goals/1/tasks/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 8. Update Task Status
```bash
curl -X PATCH http://localhost:8000/api/tasks/1/update-status/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "done"
  }'
```

## 9. Get Goal Progress
```bash
curl -X GET http://localhost:8000/api/goals/1/progress/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 10. Get Dashboard Stats
```bash
curl -X GET http://localhost:8000/api/dashboard/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 11. Refresh Token
```bash
curl -X POST http://localhost:8000/api/token/refresh/ \
  -H "Content-Type: application/json" \
  -d '{
    "refresh": "YOUR_REFRESH_TOKEN"
  }'
```

## 12. Logout
```bash
curl -X POST http://localhost:8000/api/logout/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "refresh": "YOUR_REFRESH_TOKEN"
  }'
```

## 13. Delete Goal
```bash
curl -X DELETE http://localhost:8000/api/goals/1/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Expected Response Formats

### Register/Login Response
```json
{
  "user": {
    "id": 1,
    "username": "testuser",
    "email": "test@example.com"
  },
  "tokens": {
    "refresh": "eyJ0eXAiOiJKV1Qi...",
    "access": "eyJ0eXAiOiJKV1Qi..."
  }
}
```

### Goal List Response
```json
[
  {
    "id": 1,
    "user": "testuser",
    "title": "Master Python",
    "level": "Intermediate",
    "time_per_day": 3,
    "deadline": "2026-12-31",
    "created_at": "2026-02-16T10:30:00Z",
    "tasks_count": 30,
    "completed_tasks_count": 5
  }
]
```

### Goal Detail Response (with tasks)
```json
{
  "id": 1,
  "user": "testuser",
  "title": "Master Python",
  "level": "Intermediate",
  "time_per_day": 3,
  "deadline": "2026-12-31",
  "created_at": "2026-02-16T10:30:00Z",
  "tasks": [
    {
      "id": 1,
      "goal": 1,
      "day_number": 1,
      "topic": "Day 1: Topic to be determined",
      "status": "done",
      "completed_at": "2026-02-16T14:20:00Z"
    }
  ],
  "progress": {
    "id": 1,
    "goal": 1,
    "completion_percentage": 16.67,
    "streak": 5,
    "last_updated": "2026-02-16T14:20:00Z"
  }
}
```

### Dashboard Stats Response
```json
{
  "total_goals": 2,
  "total_tasks": 60,
  "completed_tasks": 10,
  "overall_completion": 16.67,
  "current_streak": 5,
  "today_tasks": [
    {
      "id": 6,
      "goal": 1,
      "day_number": 6,
      "topic": "Day 6: Topic to be determined",
      "status": "pending",
      "completed_at": null
    }
  ]
}
```
