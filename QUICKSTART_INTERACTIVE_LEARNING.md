# Quick Start Guide - Interactive Learning Platform

## Prerequisites
- Backend server running on port 8000
- Frontend server running on port 5173
- User account registered and logged in
- At least one learning plan created

## Testing the Interactive Learning Flow

### Step 1: Start Servers

**Backend:**
```bash
cd backend
python app.py
```

**Frontend:**
```bash
npm run dev
```

### Step 2: Create a Learning Plan (If Not Already Created)

1. Navigate to `http://localhost:5173/login`
2. Login with your credentials
3. Go to Dashboard → Create Plan
4. Fill in the form:
   - Title: "Learn Python Programming"
   - Description: "Master Python fundamentals"
   - Level: Intermediate
   - Duration: 30 days
5. Click "Create Goal" and wait for AI to generate roadmap

### Step 3: Start Interactive Learning

1. From the **Dashboard**, find your current task
2. Click the **"Start Learning"** button
3. You'll be redirected to `/learn/:taskId`

### Step 4: Explore the Interactive Lesson

**Left Panel - Learning Content:**
- Watch the embedded YouTube video tutorial
- Read the AI-generated lesson explanation
- Review key concepts
- Check additional learning resources
- Copy example code

**Right Panel - Code Editor:**
- Write or edit code in the editor
- Select programming language (displayed in badge)
- Click **"▶ Run"** to execute code (simulated)
- View output in the terminal below
- Click **"Reset"** to restore example code

### Step 5: Take the Quiz

1. When ready, click **"Take Quiz"** button in the header
2. You'll see 5 AI-generated questions
3. Answer each multiple-choice question
4. Click radio buttons to select your answer
5. Timer tracks your time (top right corner)
6. Question difficulty badges show easy/medium/hard
7. Click **"Submit Quiz"** when all questions answered

### Step 6: Review Assessment

After submission, you'll see:
- **Score percentage** (color-coded: green ≥80%, yellow ≥60%, red <60%)
- **Correct vs total answers**
- **Time taken**
- **AI-generated suggestions** based on your performance
- **Detailed review** of each question:
  - Your answer
  - Correct answer (if you got it wrong)
  - Explanation for each question

### Step 7: Next Actions

From the assessment page:
- **Review Lesson** - Go back to learning page
- **Back to Dashboard** - Return to main dashboard
- Continue to next task from dashboard

## Testing Different Scenarios

### Test 1: First-Time Lesson Generation
1. Start learning on a new task
2. Wait for AI to generate lesson content (~5-10 seconds)
3. Verify lesson explanation, key concepts, and example code appear
4. Check that YouTube videos are linked

### Test 2: Code Editor Functionality
1. Open the code editor on the right panel
2. Clear the code and write your own
3. Click "Run" and verify output appears
4. Click "Reset" and verify example code is restored

### Test 3: Quiz Generation and Submission
1. Take quiz on a task
2. Answer some questions correctly, leave some incorrect
3. Submit and verify:
   - Score calculation is correct
   - Green checkmarks for correct answers
   - Red X marks for incorrect answers
   - Explanations appear for all questions
   - AI suggestions match your performance level

### Test 4: Resource Switching
1. In the learning page left panel
2. Click different resources in the "Learning Resources" section
3. Verify video changes in the iframe
4. Test both video and article links

### Test 5: Navigation Flow
1. Dashboard → Start Learning → Learn Page
2. Learn Page → Take Quiz → Quiz Page
3. Quiz Page → Review Lesson → Learn Page
4. Quiz Page → Back to Dashboard → Dashboard

## API Testing with cURL

### Get Lesson Content
```bash
curl -X GET http://localhost:8000/api/lessons/task/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Generate Quiz
```bash
curl -X GET http://localhost:8000/api/lessons/task/1/quiz \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Submit Quiz
```bash
curl -X POST http://localhost:8000/api/lessons/task/1/quiz/submit \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "answers": [
      {"quiz_id": 1, "answer": "Option A"},
      {"quiz_id": 2, "answer": "Option B"},
      {"quiz_id": 3, "answer": "Option C"},
      {"quiz_id": 4, "answer": "Option D"},
      {"quiz_id": 5, "answer": "Option A"}
    ]
  }'
```

### Get Assessment
```bash
curl -X GET http://localhost:8000/api/lessons/task/1/assessment \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Troubleshooting

### Issue: "Lesson not found" error
**Solution:** The task might not exist. Ensure you have created a learning plan and have tasks in your goals.

### Issue: "Please create a learning plan first" message
**Solution:** Go to Dashboard → Create Plan and generate a roadmap first.

### Issue: YouTube videos not loading
**Solution:** 
- Check if the video URL is valid
- Ensure you're not blocking iframe embeds
- Try different resources in the list

### Issue: Code editor not running code
**Solution:** Code execution is currently simulated. For real execution, integrate Judge0 or Piston API.

### Issue: Quiz questions not appearing
**Solution:** 
- Check backend logs for AI generation errors
- Verify Groq API key is set correctly in `.env`
- Try regenerating the lesson

### Issue: Backend 401 errors
**Solution:** 
- Ensure you're logged in
- Check if JWT token is expired
- Re-login if necessary

## Database Inspection

To view the generated data in SQLite:

```bash
cd backend
python
```

```python
from app import app
from models import db, LessonContent, Quiz, Assessment

with app.app_context():
    # View all lessons
    lessons = LessonContent.query.all()
    for lesson in lessons:
        print(f"Task {lesson.task_id}: {lesson.explanation[:100]}...")
    
    # View all quizzes
    quizzes = Quiz.query.all()
    for quiz in quizzes:
        print(f"Q: {quiz.question}")
    
    # View all assessments
    assessments = Assessment.query.all()
    for assessment in assessments:
        print(f"Score: {assessment.score_percentage}% - Suggestions: {len(assessment.ai_suggestions)}")
```

## Expected Behavior

### Lesson Generation (First Time)
- Takes 5-10 seconds
- AI generates 2-3 paragraph explanation
- Creates 3-5 key concepts
- Provides example code snippet
- Suggests 3 learning resources (2 videos, 1 article)

### Quiz Generation (First Time)
- Takes 5-10 seconds
- AI generates exactly 5 questions
- Mix of easy/medium/hard difficulty
- All questions have 4 options
- Each has correct answer and explanation

### Assessment Generation (After Quiz)
- Instant calculation
- Score percentage based on correct answers
- 3-5 AI suggestions based on performance:
  - Score ≥80%: Encouragement and advanced topics
  - Score 60-79%: Focus areas and practice recommendations
  - Score <60%: Review suggestions and motivation

## Success Indicators

✅ Lesson loads within 10 seconds
✅ Video plays in iframe without errors
✅ Code editor accepts input and runs (simulated)
✅ Quiz displays 5 questions with options
✅ Timer counts up during quiz
✅ Submit validation prevents incomplete submission
✅ Results show correct score calculation
✅ AI suggestions are relevant and helpful
✅ Navigation between pages works smoothly
✅ No console errors or warnings

## Performance Notes

- **First Lesson Generation:** ~5-10 seconds (Groq AI call)
- **Subsequent Lesson Loads:** <1 second (cached in database)
- **First Quiz Generation:** ~5-10 seconds (Groq AI call)
- **Subsequent Quiz Loads:** <1 second (cached in database)
- **Quiz Submission & Assessment:** ~2-3 seconds (AI suggestion generation)

## Resources

- **Backend API Docs:** `backend/API_TESTING.md`
- **Implementation Details:** `INTERACTIVE_LEARNING_IMPLEMENTATION.md`
- **Groq API Docs:** https://console.groq.com/docs
- **React Router Docs:** https://reactrouter.com/

---

**Happy Testing!** 🚀

If you encounter any issues, check the browser console (F12) and backend terminal output for error messages.
