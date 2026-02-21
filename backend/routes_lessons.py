"""
Lesson, Quiz, and Assessment Routes for SkillPilot AI
Handles interactive learning content, resources, quizzes, and analytics
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Task, LessonContent, LearningResource, Quiz, QuizAttempt, Assessment, Goal
from services.ai_service import AIService
from datetime import datetime
import json

lessons_bp = Blueprint('lessons', __name__, url_prefix='/api/lessons')


@lessons_bp.route('/task/<int:task_id>', methods=['GET'])
@jwt_required()
def get_lesson_content(task_id):
    """
    Get detailed lesson content for a specific task
    Auto-generates if doesn't exist
    """
    current_user_id = get_jwt_identity()
    
    # Verify task belongs to user
    task = Task.query.get(task_id)
    if not task or task.goal.user_id != current_user_id:
        return jsonify({'error': 'Task not found'}), 404
    
    # Check if lesson content already exists
    lesson = LessonContent.query.filter_by(task_id=task_id).first()
    
    if not lesson:
        # Generate lesson content using AI
        lesson = generate_lesson_content(task)
    
    return jsonify({
        'task': task.to_dict(),
        'lesson': lesson.to_dict(include_resources=True)
    }), 200


@lessons_bp.route('/task/<int:task_id>/generate', methods=['POST'])
@jwt_required()
def generate_lesson(task_id):
    """Force regenerate lesson content with AI"""
    current_user_id = get_jwt_identity()
    
    task = Task.query.get(task_id)
    if not task or task.goal.user_id != current_user_id:
        return jsonify({'error': 'Task not found'}), 404
    
    # Delete existing content
    existing = LessonContent.query.filter_by(task_id=task_id).first()
    if existing:
        db.session.delete(existing)
        db.session.commit()
    
    # Generate new content
    lesson = generate_lesson_content(task)
    
    return jsonify({
        'message': 'Lesson generated successfully',
        'lesson': lesson.to_dict(include_resources=True)
    }), 200


@lessons_bp.route('/task/<int:task_id>/quiz', methods=['GET'])
@jwt_required()
def get_quiz(task_id):
    """
    Get quiz questions for a task
    Auto-generates 5 questions if don't exist
    """
    current_user_id = get_jwt_identity()
    
    task = Task.query.get(task_id)
    if not task or task.goal.user_id != current_user_id:
        return jsonify({'error': 'Task not found'}), 404
    
    # Check if quiz exists
    quizzes = Quiz.query.filter_by(task_id=task_id).all()
    
    if not quizzes or len(quizzes) == 0:
        # Generate quiz using AI
        quizzes = generate_quiz(task)
    
    return jsonify({
        'task_id': task_id,
        'topic': task.topic,
        'questions': [quiz.to_dict(include_answer=False) for quiz in quizzes]
    }), 200


@lessons_bp.route('/task/<int:task_id>/quiz/submit', methods=['POST'])
@jwt_required()
def submit_quiz(task_id):
    """
    Submit quiz answers and get assessment
    Body: { answers: [{quiz_id: 1, answer: "option_a"}] }
    """
    current_user_id = get_jwt_identity()
    
    task = Task.query.get(task_id)
    if not task or task.goal.user_id != current_user_id:
        return jsonify({'error': 'Task not found'}), 404
    
    data = request.get_json()
    answers = data.get('answers', [])
    
    if not answers:
        return jsonify({'error': 'No answers provided'}), 400
    
    # Process each answer
    correct_count = 0
    total_questions = len(answers)
    results = []
    
    for answer_data in answers:
        quiz_id = answer_data.get('quiz_id')
        user_answer = answer_data.get('answer', '').strip()
        
        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            continue
        
        is_correct = (user_answer.lower() == quiz.correct_answer.lower())
        if is_correct:
            correct_count += 1
        
        # Save attempt
        attempt = QuizAttempt(
            user_id=current_user_id,
            task_id=task_id,
            quiz_id=quiz_id,
            user_answer=user_answer,
            is_correct=is_correct
        )
        db.session.add(attempt)
        
        results.append({
            'quiz_id': quiz_id,
            'question': quiz.question,
            'your_answer': user_answer,
            'correct_answer': quiz.correct_answer,
            'is_correct': is_correct,
            'explanation': quiz.explanation
        })
    
    db.session.commit()
    
    # Create assessment
    score_percentage = (correct_count / total_questions) * 100 if total_questions > 0 else 0
    
    # Generate AI suggestions
    ai_suggestions = generate_assessment_suggestions(task, score_percentage, results)
    
    assessment = Assessment(
        user_id=current_user_id,
        task_id=task_id,
        goal_id=task.goal_id,
        total_questions=total_questions,
        correct_answers=correct_count,
        score_percentage=score_percentage,
        ai_suggestions=ai_suggestions
    )
    assessment.calculate_score()
    db.session.add(assessment)
    db.session.commit()
    
    return jsonify({
        'score_percentage': round(score_percentage, 2),
        'correct_answers': correct_count,
        'total_questions': total_questions,
        'results': results,
        'assessment': assessment.to_dict()
    }), 200


@lessons_bp.route('/task/<int:task_id>/assessment', methods=['GET'])
@jwt_required()
def get_assessment(task_id):
    """Get latest assessment for a task"""
    current_user_id = get_jwt_identity()
    
    task = Task.query.get(task_id)
    if not task or task.goal.user_id != current_user_id:
        return jsonify({'error': 'Task not found'}), 404
    
    assessment = Assessment.query.filter_by(
        user_id=current_user_id,
        task_id=task_id
    ).order_by(Assessment.completed_at.desc()).first()
    
    if not assessment:
        return jsonify({'message': 'No assessment found'}), 404
    
    return jsonify(assessment.to_dict()), 200


# Helper Functions

def generate_lesson_content(task):
    """Generate lesson content using AI"""
    goal = task.goal
    
    prompt = f"""Generate a detailed lesson for:
Topic: {task.topic}
Level: {goal.level}
Goal: {goal.title}

Provide:
1. Comprehensive explanation (2-3 paragraphs)
2. 3-5 key concepts (as array)
3. Example code snippet (if applicable)
4. Programming language used

Return as JSON:
{{
  "explanation": "...",
  "key_concepts": ["concept1", "concept2"],
  "example_code": "...",
  "programming_language": "python"
}}
"""
    
    try:
        response = AIService.chat_with_ai(prompt, [])
        # Parse JSON from response
        lesson_data = json.loads(response)
    except:
        # Fallback to placeholder
        lesson_data = {
            "explanation": f"This lesson covers {task.topic}. You'll learn the fundamentals and practical applications.",
            "key_concepts": ["Understanding basics", "Practical implementation", "Best practices"],
            "example_code": "# Example code for " + task.topic,
            "programming_language": "python"
        }
    
    # Create lesson content
    lesson = LessonContent(
        task_id=task.id,
        explanation=lesson_data.get('explanation', ''),
        key_concepts=lesson_data.get('key_concepts', []),
        example_code=lesson_data.get('example_code'),
        programming_language=lesson_data.get('programming_language', 'python')
    )
    db.session.add(lesson)
    db.session.commit()
    
    # Generate learning resources
    generate_learning_resources(lesson, task)
    
    return lesson


def generate_learning_resources(lesson, task):
    """Generate YouTube video recommendations and resources"""
    # For now, create placeholder resources
    # In production, you'd use YouTube API or scraping
    
    resources_data = [
        {
            'type': 'video',
            'title': f'{task.topic} - Complete Tutorial',
            'url': f'https://www.youtube.com/results?search_query={task.topic.replace(" ", "+")}+tutorial',
            'description': 'Comprehensive video tutorial',
            'provider': 'youtube',
            'order': 1
        },
        {
            'type': 'video',
            'title': f'{task.topic} - Beginner Guide',
            'url': f'https://www.youtube.com/results?search_query={task.topic.replace(" ", "+")}+beginner',
            'description': 'Beginner-friendly explanation',
            'provider': 'youtube',
            'order': 2
        },
        {
            'type': 'article',
            'title': f'{task.topic} - Documentation',
            'url': f'https://www.google.com/search?q={task.topic.replace(" ", "+")}+documentation',
            'description': 'Official documentation and guides',
            'provider': 'google',
            'order': 3
        }
    ]
    
    for res_data in resources_data:
        resource = LearningResource(
            lesson_id=lesson.id,
            resource_type=res_data['type'],
            title=res_data['title'],
            url=res_data['url'],
            description=res_data['description'],
            provider=res_data['provider'],
            recommended_order=res_data['order']
        )
        db.session.add(resource)
    
    db.session.commit()


def generate_quiz(task):
    """Generate 5 quiz questions using AI"""
    prompt = f"""Generate 5 multiple-choice quiz questions for:
Topic: {task.topic}
Level: {task.goal.level}

Return as JSON array:
[
  {{
    "question": "What is...?",
    "options": ["option_a", "option_b", "option_c", "option_d"],
    "correct_answer": "option_a",
    "explanation": "Explanation of answer",
    "difficulty": "easy"
  }}
]
"""
    
    try:
        response = AIService.chat_with_ai(prompt, [])
        questions = json.loads(response)
    except:
        # Fallback questions
        questions = [
            {
                "question": f"What is the main concept of {task.topic}?",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "correct_answer": "Option A",
                "explanation": "This covers the fundamental concept",
                "difficulty": "easy"
            }
        ] * 5
    
    quizzes = []
    for q_data in questions[:5]:  # Ensure only 5 questions
        quiz = Quiz(
            task_id=task.id,
            question=q_data.get('question', ''),
            question_type='multiple_choice',
            options=q_data.get('options', []),
            correct_answer=q_data.get('correct_answer', ''),
            explanation=q_data.get('explanation', ''),
            difficulty=q_data.get('difficulty', 'medium')
        )
        db.session.add(quiz)
        quizzes.append(quiz)
    
    db.session.commit()
    return quizzes


def generate_assessment_suggestions(task, score, results):
    """Generate AI-powered suggestions based on quiz performance"""
    incorrect_topics = [r['question'] for r in results if not r['is_correct']]
    
    if score >= 80:
        suggestions = [
            "Excellent work! You've mastered this topic.",
            "Consider moving to more advanced concepts.",
            "Practice by building a small project using these concepts."
        ]
    elif score >= 60:
        suggestions = [
            "Good progress! Focus on the questions you missed.",
            "Review the explanations for incorrect answers.",
            "Try the practice exercises to reinforce learning."
        ]
    else:
        suggestions = [
            "Don't worry! Learning takes time and practice.",
            "Review the lesson content again carefully.",
            "Watch the recommended videos for better understanding.",
            "Consider redoing the quiz after reviewing."
        ]
    
    return suggestions
