# SkillPilot AI - Flask Backend

Production-ready Flask REST API for AI-powered learning platform.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Run Server
```bash
python app.py
```

Server: http://localhost:8000

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate
```

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Setup Environment Variables
```bash
# Copy the example file
copy .env.example .env  # Windows
cp .env.example .env    # Mac/Linux

# Edit .env and update:
# - SECRET_KEY (generate a secure one)
# - DATABASE_URL (your PostgreSQL connection)
# - DEBUG (False in production)
```

### 4. Setup PostgreSQL Database
```sql
-- Create database
CREATE DATABASE skillpilot;

-- Create user (optional)
CREATE USER skillpilot_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE skillpilot TO skillpilot_user;
```

### 5. Run Migrations
```bash
python manage.py makemigrations
python manage.py migrate
```

### 6. Create Superuser
```bash
python manage.py createsuperuser
```

### 7. Run Development Server
```bash
python manage.py runserver
```

Server will be available at: `http://localhost:8000`

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/register/` | User registration | ❌ |
| POST | `/api/login/` | User login | ❌ |
| POST | `/api/logout/` | User logout | ✅ |
| POST | `/api/token/refresh/` | Refresh JWT token | ❌ |
| GET | `/api/profile/` | Get user profile | ✅ |

### Goals
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/goals/` | List all user goals | ✅ |
| POST | `/api/goals/` | Create new goal | ✅ |
| GET | `/api/goals/<id>/` | Get goal details | ✅ |
| DELETE | `/api/goals/<id>/` | Delete goal | ✅ |

### Tasks
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/goals/<id>/tasks/` | List goal tasks | ✅ |
| PATCH | `/api/tasks/<id>/update-status/` | Update task status | ✅ |

### Progress
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/goals/<id>/progress/` | Get goal progress | ✅ |
| GET | `/api/dashboard/` | Get dashboard stats | ✅ |

---

## 📝 Example API Requests

### Register User
```bash
POST /api/register/
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePassword123",
  "password2": "SecurePassword123",
  "first_name": "John",
  "last_name": "Doe"
}
```

### Login
```bash
POST /api/login/
Content-Type: application/json

{
  "username": "john_doe",
  "password": "SecurePassword123"
}
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com"
  },
  "tokens": {
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  }
}
```

### Create Goal
```bash
POST /api/goals/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "title": "Learn React Development",
  "level": "Intermediate",
  "time_per_day": 2,
  "deadline": "2026-03-30"
}
```

### Update Task Status
```bash
PATCH /api/tasks/1/update-status/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "status": "done"
}
```

---

## 🏗️ Project Structure

```
backend/
├── manage.py
├── requirements.txt
├── .env.example
├── .gitignore
├── skillpilot/
│   ├── __init__.py
│   ├── settings.py      # Django configuration
│   ├── urls.py          # Main URL routing
│   ├── wsgi.py
│   └── asgi.py
└── apps/
    ├── accounts/        # Authentication app
    │   ├── models.py
    │   ├── serializers.py
    │   ├── views.py
    │   └── urls.py
    └── goals/           # Goals/Tasks app
        ├── models.py    # Goal, Task, Progress models
        ├── serializers.py
        ├── views.py
        ├── urls.py
        └── signals.py
```

---

## 🔒 Security Features

✅ JWT Authentication with token refresh  
✅ Token blacklisting on logout  
✅ Password validation  
✅ CORS protection  
✅ Environment variable configuration  
✅ SQL injection protection (Django ORM)  
✅ XSS protection  
✅ CSRF protection  
✅ Secure headers (production)  

---

## 🗄️ Database Models

### Goal
- `user` - ForeignKey to User
- `title` - CharField
- `level` - Choice (Beginner/Intermediate/Advanced)
- `time_per_day` - Integer (hours)
- `deadline` - DateField
- `created_at` - Auto timestamp

### Task
- `goal` - ForeignKey to Goal
- `day_number` - Integer (1-30)
- `topic` - CharField
- `status` - Choice (pending/done)
- `completed_at` - DateTimeField (nullable)

### Progress
- `goal` - OneToOneField to Goal
- `completion_percentage` - Float (0-100)
- `streak` - Integer (consecutive days)
- `last_updated` - Auto timestamp

---

## 🚀 Production Deployment

### Using Gunicorn
```bash
gunicorn skillpilot.wsgi:application --bind 0.0.0.0:8000
```

### Environment Variables for Production
```env
SECRET_KEY=your-production-secret-key-min-50-characters-long
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
DATABASE_URL=postgresql://user:password@host:5432/database
```

### Collect Static Files
```bash
python manage.py collectstatic --noinput
```

---

## 🧪 Testing

```bash
# Run tests
python manage.py test

# Check for issues
python manage.py check

# Validate models
python manage.py validate
```

---

## 📚 Additional Commands

```bash
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Django shell
python manage.py shell

# Show migrations
python manage.py showmigrations

# Database shell
python manage.py dbshell
```

---

## 🔧 Troubleshooting

### Database Connection Error
- Check PostgreSQL is running
- Verify DATABASE_URL in .env
- Ensure database exists

### JWT Token Error
- Check SECRET_KEY is set
- Verify token expiration settings
- Ensure token is in Authorization header

### CORS Error
- Add frontend URL to CORS_ALLOWED_ORIGINS in settings.py
- Check ALLOWED_HOSTS includes your domain

---

## 📞 Support

For issues or questions, please check:
- Django documentation: https://docs.djangoproject.com/
- DRF documentation: https://www.django-rest-framework.org/
- SimpleJWT documentation: https://django-rest-framework-simplejwt.readthedocs.io/

---

**Built with ❤️ for SkillPilot AI**
