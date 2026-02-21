"""
AI Service for SkillPilot AI
Handles Groq API integration for roadmap generation and chat
"""
import json
import os
from decouple import config

# Try importing groq, handle if not installed
try:
    from groq import Groq
    GROQ_AVAILABLE = True
except ImportError:
    GROQ_AVAILABLE = False


class AIService:
    """Service for AI integration with Groq"""
    
    # Groq client instance
    client = None
    
    @staticmethod
    def initialize():
        """Initialize Groq API key"""
        if GROQ_AVAILABLE:
            api_key = config('GROQ_API_KEY', default='')
            if api_key:
                AIService.client = Groq(api_key=api_key)
    
    @staticmethod
    def _get_client():
        """Get or initialize Groq client"""
        if AIService.client is None and GROQ_AVAILABLE:
            AIService.initialize()
        return AIService.client
    
    @staticmethod
    def generate_roadmap(goal_title, goal_level, goal_duration_days=30):
        """
        Generate a structured 30-day roadmap using OpenAI
        
        Args:
            goal_title: Title of the learning goal
            goal_level: Level (beginner, intermediate, advanced)
            goal_duration_days: Number of days for the roadmap
        
        Returns:
            List of tasks with day, topic, estimated_time
            Falls back to placeholder roadmap if AI fails
        """
        client = AIService._get_client()
        if not client:
            return AIService._generate_placeholder_roadmap(goal_title, goal_level, goal_duration_days)
        
        try:
            prompt = f"""Generate a structured {goal_duration_days}-day learning roadmap for the following goal.
            
Goal: {goal_title}
Level: {goal_level}

Return ONLY a valid JSON array with exactly {goal_duration_days} objects. Each object must have:
- "day": day number (1-{goal_duration_days})
- "topic": specific topic to learn (string)
- "estimated_time": estimated time in minutes (integer, typically {30}-120)

Example format:
[
  {{"day": 1, "topic": "Introduction and Setup", "estimated_time": 45}},
  {{"day": 2, "topic": "Core Concepts Part 1", "estimated_time": 60}}
]

IMPORTANT: Return ONLY the JSON array, no other text. Ensure all {goal_duration_days} days are included."""

            response = client.chat.completions.create(
                model="llama-3.3-70b-versatile",
                messages=[
                    {"role": "system", "content": "You are an expert curriculum designer. Generate learning roadmaps as JSON arrays only."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=4000
            )
            
            # Parse response
            roadmap_text = response.choices[0].message.content.strip()
            roadmap = json.loads(roadmap_text)
            
            # Validate roadmap
            if isinstance(roadmap, list) and len(roadmap) == goal_duration_days:
                return roadmap
            else:
                return AIService._generate_placeholder_roadmap(goal_title, goal_level, goal_duration_days)
        
        except Exception as e:
            print(f"AI roadmap generation failed: {str(e)}")
            return AIService._generate_placeholder_roadmap(goal_title, goal_level, goal_duration_days)
    
    @staticmethod
    def _generate_placeholder_roadmap(goal_title, goal_level, days=30):
        """Generate a fallback placeholder roadmap"""
        base_time = {
            'beginner': 30,
            'intermediate': 60,
            'advanced': 90
        }.get(goal_level, 45)
        
        roadmap = []
        for day in range(1, days + 1):
            roadmap.append({
                'day': day,
                'topic': f"Day {day}: {goal_title} - Phase {(day - 1) // 10 + 1}",
                'estimated_time': base_time
            })
        
        return roadmap
    
    @staticmethod
    def chat_with_ai(message, conversation_history=None):
        """
        Send a message to Groq and get a response
        
        Args:
            message: User message
            conversation_history: List of previous messages for context
        
        Returns:
            AI response text
        """
        client = AIService._get_client()
        if not client:
            return "AI service is not available. Please check your Groq API configuration."
        
        try:
            messages = [
                {"role": "system", "content": "You are SkillPilot, a friendly AI learning assistant. Help users learn effectively, answer questions, and provide encouragement. Keep responses concise and helpful."}
            ]
            
            # Add conversation history (only last 8 messages, excluding current user message)
            if conversation_history:
                # Filter out the last message (current user message already added)
                history = conversation_history[-9:-1] if len(conversation_history) > 1 else []
                for msg in history:
                    if isinstance(msg, dict) and 'role' in msg and 'content' in msg:
                        messages.append({"role": msg['role'], "content": msg['content']})
            
            # Add current message
            messages.append({"role": "user", "content": message})
            
            print(f"[DEBUG] Sending {len(messages)} messages to Groq")
            
            response = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=messages,
                temperature=0.7,
                max_tokens=500
            )
            
            print(f"[DEBUG] Got response from Groq successfully")
            return response.choices[0].message.content.strip()
        
        except Exception as e:
            import traceback
            print(f"[ERROR] AI chat failed: {str(e)}")
            print(f"[ERROR] Full traceback: {traceback.format_exc()}")
            return "Sorry, I'm having trouble processing your request. Please try again later."
    
    @staticmethod
    def simplify_concept(concept, explanation_level='beginner'):
        """
        Break down a complex concept into easy-to-understand explanation
        """
        client = AIService._get_client()
        if not client:
            return f"Unable to simplify '{concept}' at this time."
        
        try:
            prompt = f"""Explain the following concept in a simple way suitable for a {explanation_level}:

Concept: {concept}

Provide:
1. Simple explanation (2-3 sentences)
2. One concrete example
3. A memory tip or analogy

Keep it beginner-friendly and encouraging."""

            response = client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=[
                    {"role": "system", "content": "You are an expert educator who explains complex concepts simply."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.7,
                max_tokens=300
            )
            
            return response.choices[0].message.content.strip()
        
        except Exception as e:
            print(f"Concept simplification failed: {str(e)}")
            return f"Unable to simplify '{concept}' at this time."
