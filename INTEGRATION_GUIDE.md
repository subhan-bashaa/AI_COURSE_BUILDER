# Frontend-Backend Integration Guide

## ✅ Successfully Connected!

Your SkillPilot AI React frontend is now connected to the Flask backend API.

## 🔗 Connection Details

- **Frontend URL**: http://localhost:5177
- **Backend API**: http://localhost:8000/api
- **Health Check**: http://localhost:8000/health

## 🎯 How It Works

### Authentication Flow

1. **Register** (`/register`)
   - User fills in username, email, password
   - Frontend sends POST to `/api/register`
   - Backend creates user and returns JWT tokens
   - Tokens stored in localStorage
   - User redirected to create plan page

2. **Login** (`/login`)
   - User enters username and password  
   - Frontend sends POST to `/api/login`
   - Backend validates credentials
   - Returns JWT access & refresh tokens
   - Tokens stored in localStorage
   - User redirected to dashboard

3. **Create Goal** (`/dashboard/create-plan`)
   - User fills goal form
   - AI generates 30-day roadmap (frontend)
   - Frontend sends POST to `/api/goals` with JWT token
   - Backend creates Goal with 30 Tasks
   - Backend creates Progress tracker
   - User redirected to roadmap

4. **View Roadmap** (`/dashboard/roadmap`)
   - Frontend fetches goal and tasks from `/api/goals/{id}/tasks`
   - Displays tasks with status
   - User can mark tasks as completed
   - Frontend sends PATCH to `/api/tasks/{id}/update-status`
   - Backend updates task and recalculates progress

5. **Dashboard** (`/dashboard`)
   - Frontend fetches `/api/dashboard` for stats
   - Shows total goals, tasks, completion percentage
   - Displays current progress and streak

## 🧪 Testing the Integration

### 1. Register a New User
```bash
# Open browser to http://localhost:5177/register
# Fill in:
- Username: testuser
- Email: test@example.com
- Password: test123
- Confirm Password: test123
# Click "Create Account"
```

### 2. Create a Learning Goal
```bash
# After registration, you'll be at /dashboard/create-plan
# Fill in:
- Goal: Learn React.js
- Current Level: Beginner
- Time Per Day: 2 hours
- Deadline: 2026-03-15
# Click "Generate My Roadmap"
# Click "Save & Start Learning"
```

### 3. View and Complete Tasks
```bash
# Navigate to /dashboard/roadmap
# You'll see 30 tasks (Day 1-30)
# Click on a task card to mark it as completed
# Progress bar will update automatically
```

### 4. Check Dashboard Stats
```bash
# Navigate to /dashboard
# See your total goals, tasks, and progress
```

## 📡 API Endpoints Used

| Page | Endpoint | Method | Purpose |
|------|----------|--------|---------|
| Register | `/api/register` | POST | Create new user |
| Login | `/api/login` | POST | Authenticate user |
| Create Plan | `/api/goals` | POST | Save learning goal |
| Roadmap | `/api/goals/{id}/tasks` | GET | Fetch tasks |
| Roadmap | `/api/tasks/{id}/update-status` | PATCH | Update task |
| Dashboard | `/api/dashboard` | GET | Get statistics |
| Dashboard | `/api/goals` | GET | List all goals |
| Dashboard | `/api/goals/{id}/progress` | GET | Get progress |

## 🔒 Authentication

All dashboard endpoints require JWT authentication. The token is automatically included in requests via the `Authorization: Bearer <token>` header.

### Token Storage

- **Access Token**: Stored in `localStorage.getItem('access_token')`
- **Refresh Token**: Stored in `localStorage.getItem('refresh_token')`
- **User Data**: Stored in `localStorage.getItem('user')`

### Token Expiration

- Access tokens expire after 1 hour
- Refresh tokens expire after 7 days
- When access token expires, use refresh token to get a new one
- Frontend API service handles this automatically

## 🛠️ Files Modified

### Frontend
- ✅ `src/services/api.js` - API service layer
- ✅ `src/pages/Login.jsx` - Backend authentication
- ✅ `src/pages/Register.jsx` - Backend registration
- ✅ `src/pages/CreatePlan.jsx` - Save goals to backend

### Backend
- ✅ `backend/config.py` - Added CORS for port 5177
- ✅ `backend/app.py` - Flask application
- ✅ `backend/models.py` - SQLAlchemy models
- ✅ `backend/routes_auth.py` - Auth endpoints
- ✅ `backend/routes_goals.py` - Goals/Tasks endpoints

## 🐛 Troubleshooting

### CORS Errors
If you see CORS errors in browser console:
```bash
# Make sure backend config.py includes your frontend port
CORS_ORIGINS = ['http://localhost:5177']
```

### 401 Unauthorized
If you get 401 errors:
```bash
# Check if token exists
console.log(localStorage.getItem('access_token'))

# If not, login again
# Tokens are cleared on logout
```

### Connection Refused
If frontend can't reach backend:
```bash
# Make sure Flask server is running
python backend/app.py

# Check it's on port 8000
# Visit http://localhost:8000/health
```

### Database Errors
If backend shows database errors:
```bash
# Delete and recreate database
cd backend
rm skillpilot.db
python app.py
```

## 🚀 Next Steps

### Enhance Frontend
- [ ] Add real-time progress updates
- [ ] Implement task editing
- [ ] Add goal deletion confirmation
- [ ] Show loading states on all API calls
- [ ] Add error boundaries

### Enhance Backend
- [ ] Add email verification
- [ ] Implement password reset
- [ ] Add task descriptions and resources
- [ ] Create admin panel
- [ ] Add analytics endpoints

## 📚 Additional Resources

- Flask Backend README: `backend/README.md`
- API Testing Guide: `backend/API_TESTING.md`
- Quick Start Guide: `backend/QUICKSTART.md`

---

**🎉 Your full-stack SkillPilot AI app is now fully connected and functional!**
