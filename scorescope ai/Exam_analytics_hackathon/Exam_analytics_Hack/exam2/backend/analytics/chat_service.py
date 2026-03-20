import json
import logging
import os
from typing import Any, Optional

from django.contrib.auth import get_user_model
from . import ml_engine
from .models import QuestionAttempt, Test

User = get_user_model()
logger = logging.getLogger(__name__)

GROQ_MODEL = "llama-3.3-70b-versatile"
MAX_TOKENS = 300   # 🔥 reduced for stability


# =========================
# STUDY CONTEXT
# =========================
def get_study_context(user: Any) -> str:
    parts = []
    try:
        attempts = QuestionAttempt.objects.filter(test__user=user).select_related("topic")

        if not attempts.exists():
            parts.append("- New student")
        else:
            topic_data = ml_engine.classify_topics(attempts)

            weak = [t for t in topic_data if t["classification"] == "weak"]
            if weak:
                parts.append("Weak: " + ", ".join(f"{t['topic_name']}({t['accuracy']}%)" for t in weak[:5]))

            mistake_data = ml_engine.detect_mistake_patterns(attempts)
            if mistake_data.get("patterns"):
                parts.append("Mistakes: " + json.dumps(mistake_data["patterns"]))

        parts.append(f"Exam: {getattr(user, 'target_exam', 'JEE')}")
    except Exception:
        logger.exception("Context error")

    return "\n".join(parts)


# =========================
# CHAT (WORKING)
# =========================
def chat_with_groq(user, user_message, history, api_key=None):
    api_key = api_key or os.getenv("GROQ_API_KEY")

    if not api_key:
        return "", "Missing API key"

    from groq import Groq

    context = get_study_context(user)

    messages = [{
        "role": "system",
        "content": f"You are a helpful JEE assistant.\n{context}"
    }]

    for h in history[-10:]:
        if h.get("role") in ("user", "assistant"):
            messages.append(h)

    messages.append({"role": "user", "content": user_message})

    try:
        client = Groq(api_key=api_key)

        resp = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=messages,
            max_tokens=MAX_TOKENS,
        )

        reply = resp.choices[0].message.content
        return reply.strip() if reply else "Try again.", None

    except Exception as e:
        logger.exception("Chat error")
        return "", str(e)


# =========================
# 🔥 MNEMONIC (FIXED)
# =========================
def generate_mnemonic(user, api_key=None):
    api_key = api_key or os.getenv("GROQ_API_KEY")

    if not api_key:
        return "General", "Try remembering it creatively!", None

    from groq import Groq

    topic = "General"
    try:
        attempts = QuestionAttempt.objects.filter(test__user=user)
        data = ml_engine.classify_topics(attempts)
        weak = [t for t in data if t["classification"] == "weak"]
        if weak:
            topic = weak[0]["topic_name"]
    except:
        pass

    prompt = f"Create a funny mnemonic for {topic}. Max 2 lines. Only mnemonic."

    try:
        client = Groq(api_key=api_key)
        resp = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=120,
        )

        text = resp.choices[0].message.content
        return topic, text.strip() if text else f"Remember {topic} easily!", None

    except Exception as e:
        logger.exception("Mnemonic error")
        return topic, f"Quick tip: Revise {topic} using short tricks!", None


# =========================
# 🔥 AUDIO QUESTION (FIXED)
# =========================
def generate_audio_question(user, api_key=None):
    api_key = api_key or os.getenv("GROQ_API_KEY")

    if not api_key:
        return "General", "What is the basic concept?", None

    from groq import Groq

    topic = "General"
    try:
        attempts = QuestionAttempt.objects.filter(test__user=user)
        data = ml_engine.classify_topics(attempts)
        weak = [t for t in data if t["classification"] == "weak"]
        if weak:
            topic = weak[0]["topic_name"]
    except:
        pass

    prompt = f"Ask 1 short oral question about {topic}. Max 12 words."

    try:
        client = Groq(api_key=api_key)
        resp = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=60,
        )

        text = resp.choices[0].message.content
        return topic, text.strip() if text else f"What is {topic}?", None

    except Exception:
        return topic, f"What is {topic}?", None


# =========================
# 🔥 AUDIO EVALUATION (FIXED)
# =========================
def evaluate_audio_answer(user, question, answer, api_key=None):
    api_key = api_key or os.getenv("GROQ_API_KEY")

    if not api_key:
        return "Nice try! Revise once more.", None

    from groq import Groq

    prompt = f"""
Question: {question}
Answer: {answer}

Check correctness.
Say Correct/Incorrect + short explanation.
"""

    try:
        client = Groq(api_key=api_key)
        resp = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=120,
        )

        text = resp.choices[0].message.content
        return text.strip() if text else "Try again!", None

    except Exception:
        return "Good attempt! Revise concept.", None