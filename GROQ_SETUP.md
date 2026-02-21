# Groq API Setup Guide

## ✅ Successfully Migrated from OpenAI to Groq!

Your SkillPilot AI application now uses **Groq API** instead of OpenAI. Groq offers:
- ⚡ **Faster inference** (up to 18x faster than OpenAI)
- 💰 **Free tier available** with generous limits
- 🚀 **Open-source models** like Llama 3.1

---

## 🔑 Get Your FREE Groq API Key

1. **Visit**: https://console.groq.com/keys
2. **Sign up** for a free account (no credit card required)
3. **Create** a new API key
4. **Copy** your API key

---

## ⚙️ Configure Your Application

### Step 1: Open `.env` file
Navigate to: `backend/.env`

### Step 2: Add Your API Key
Replace `your-groq-api-key-here` with your actual key:

```env
GROQ_API_KEY=gsk_your_actual_groq_api_key_here
```

### Step 3: Restart Backend
The Flask server will auto-reload, or manually restart:

```bash
cd backend
python app.py
```

---

## 🤖 Available Models

The application now uses **Llama 3.1 70B** which provides:
- Excellent reasoning and instruction following
- Great for educational content generation
- Fast response times with Groq's infrastructure

Other Groq models you can use:
- `llama-3.1-70b-versatile` (default - balanced)
- `llama-3.1-8b-instant` (fastest)
- `mixtral-8x7b-32768` (large context)
- `gemma-7b-it` (Google's Gemma)

To change the model, edit `backend/services/ai_service.py` and replace the `model=` parameter.

---

## 🎯 What Changed?

### Updated Files:
1. ✅ `backend/services/ai_service.py` - Groq client integration
2. ✅ `backend/requirements.txt` - Groq package added
3. ✅ `backend/.env` - GROQ_API_KEY configuration
4. ✅ `backend/.env.example` - Updated template

### Features Powered by Groq:
- 💬 **AI Chat Assistant** - Interactive learning support
- 🗺️ **AI Roadmap Generation** - Personalized learning paths
- 📚 **Concept Simplification** - Break down complex topics

---

## 🧪 Test Your Setup

1. **Open the application**: http://localhost:5173
2. **Navigate to** any goal page
3. **Open the chat widget** (bottom-right corner)
4. **Send a message** like "hi" or "explain variables"
5. **You should get** a response from Groq-powered AI!

---

## 📊 Rate Limits (Free Tier)

- **Requests per minute**: 30
- **Requests per day**: 14,400
- **Tokens per minute**: 20,000

More than enough for development and testing!

---

## 🆘 Troubleshooting

### Issue: "AI service is not available"
**Solution**: Check that your `GROQ_API_KEY` is set correctly in `backend/.env`

### Issue: Chat returns error
**Solution**: Verify your API key is active at https://console.groq.com/keys

### Issue: Slow responses
**Solution**: Try using a faster model like `llama-3.1-8b-instant`

---

## 🔄 Switch Back to OpenAI (If Needed)

If you want to revert to OpenAI:

1. In `backend/services/ai_service.py`:
   - Change `from groq import Groq` → `from openai import OpenAI`
   - Change `GROQ_API_KEY` → `OPENAI_API_KEY`
   - Change model to `gpt-3.5-turbo`

2. In `backend/requirements.txt`:
   - Change `groq==0.4.2` → `openai==1.0.0`

3. In `backend/.env`:
   - Change `GROQ_API_KEY` → `OPENAI_API_KEY`

---

## 📚 Resources

- [Groq Console](https://console.groq.com)
- [Groq Documentation](https://console.groq.com/docs)
- [Groq Python SDK](https://github.com/groq/groq-python)
- [Available Models](https://console.groq.com/docs/models)

---

**Enjoy blazing-fast AI responses with Groq! 🚀**
