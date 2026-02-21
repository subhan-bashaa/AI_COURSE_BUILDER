"""
AI Chat Routes for SkillPilot AI
Provides AI chat assistant functionality
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, ConversationMessage
from services.ai_service import AIService
from datetime import datetime

ai_bp = Blueprint('ai', __name__, url_prefix='/api/ai')


@ai_bp.route('/chat', methods=['POST'])
@jwt_required()
def chat():
    """
    Send message to AI and get response
    
    Request body:
    {
        "message": "I don't understand Flexbox"
    }
    
    Response:
    {
        "response": "AI formatted explanation",
        "conversation_id": user_id (for history)
    }
    """
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not data.get('message'):
        return jsonify({'error': 'Message is required'}), 400
    
    user_message = data['message'].strip()
    
    if len(user_message) == 0:
        return jsonify({'error': 'Message cannot be empty'}), 400
    
    if len(user_message) > 5000:
        return jsonify({'error': 'Message is too long (max 5000 characters)'}), 400
    
    try:
        # Store user message
        user_msg = ConversationMessage(
            user_id=current_user_id,
            role='user',
            content=user_message
        )
        db.session.add(user_msg)
        db.session.commit()
        
        print(f"[DEBUG] User {current_user_id} sent: {user_message[:50]}...")
        
        # Get conversation history
        history = ConversationMessage.query.filter_by(
            user_id=current_user_id
        ).order_by(ConversationMessage.created_at).all()
        
        print(f"[DEBUG] Found {len(history)} messages in history")
        
        # Format history for AI
        conversation_history = [
            {"role": msg.role, "content": msg.content}
            for msg in history[-10:]  # Last 10 messages for context
        ]
        
        print(f"[DEBUG] Calling AIService.chat_with_ai...")
        
        # Get AI response
        ai_response = AIService.chat_with_ai(user_message, conversation_history)
        
        print(f"[DEBUG] Got response: {ai_response[:50]}...")
        
        # Store AI response
        assistant_msg = ConversationMessage(
            user_id=current_user_id,
            role='assistant',
            content=ai_response
        )
        db.session.add(assistant_msg)
        db.session.commit()
        
        return jsonify({
            'response': ai_response,
            'user_id': current_user_id,
            'timestamp': datetime.utcnow().isoformat()
        }), 200
    
    except Exception as e:
        import traceback
        print(f"[ERROR] Chat endpoint failed: {str(e)}")
        print(f"[ERROR] Full traceback: {traceback.format_exc()}")
        return jsonify({'error': f'Chat failed: {str(e)}'}), 500


@ai_bp.route('/chat/history', methods=['GET'])
@jwt_required()
def get_chat_history():
    """Get conversation history for current user"""
    current_user_id = get_jwt_identity()
    limit = request.args.get('limit', 50, type=int)
    
    # Limit to max 100 messages
    limit = min(limit, 100)
    
    messages = ConversationMessage.query.filter_by(
        user_id=current_user_id
    ).order_by(ConversationMessage.created_at.desc()).limit(limit).all()
    
    # Reverse to show oldest first
    messages = list(reversed(messages))
    
    return jsonify({
        'messages': [msg.to_dict() for msg in messages],
        'count': len(messages)
    }), 200


@ai_bp.route('/chat/clear', methods=['POST'])
@jwt_required()
def clear_chat_history():
    """Clear conversation history for current user"""
    current_user_id = get_jwt_identity()
    
    ConversationMessage.query.filter_by(user_id=current_user_id).delete()
    db.session.commit()
    
    return jsonify({'message': 'Chat history cleared'}), 200


@ai_bp.route('/simplify', methods=['POST'])
@jwt_required()
def simplify_concept():
    """
    Get simplified explanation of a concept
    
    Request body:
    {
        "concept": "Flexbox",
        "level": "beginner"  (optional)
    }
    """
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not data.get('concept'):
        return jsonify({'error': 'Concept is required'}), 400
    
    concept = data['concept'].strip()
    level = data.get('level', 'beginner').lower()
    
    if level not in ['beginner', 'intermediate', 'advanced']:
        level = 'beginner'
    
    try:
        explanation = AIService.simplify_concept(concept, level)
        
        return jsonify({
            'concept': concept,
            'level': level,
            'explanation': explanation
        }), 200
    
    except Exception as e:
        return jsonify({'error': f'Simplification failed: {str(e)}'}), 500


@ai_bp.route('/generate-example', methods=['POST'])
@jwt_required()
def generate_example():
    """
    Generate a practical example for a topic
    
    Request body:
    {
        "topic": "Async/Await in JavaScript",
        "language": "javascript"
    }
    """
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not data.get('topic'):
        return jsonify({'error': 'Topic is required'}), 400
    
    topic = data['topic'].strip()
    language = data.get('language', 'javascript')
    
    try:
        prompt = f"""Generate a practical, beginner-friendly code example for: {topic}

Programming Language: {language}

Requirements:
1. Keep it simple and under 20 lines
2. Include comments explaining each step
3. Show a real-world use case
4. Make it runnable/executable

Format as a code block with clear explanation before and after."""

        from services.ai_service import openai
        if not openai:
            return jsonify({'error': 'AI service not available'}), 503
        
        import openai as openai_module
        response = openai_module.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are an expert programmer who creates clear code examples."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=500
        )
        
        example = response.choices[0].message.content.strip()
        
        return jsonify({
            'topic': topic,
            'language': language,
            'example': example
        }), 200
    
    except Exception as e:
        return jsonify({'error': f'Example generation failed: {str(e)}'}), 500
