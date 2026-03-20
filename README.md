# 🚀 ScoreScope AI

ScoreScope AI is an intelligent exam analytics platform designed to help students analyze performance, identify weak areas, and improve learning outcomes using AI-driven insights.

---

## 📌 Features

* 📊 Exam Performance Analysis
* 🤖 AI-Powered Insights
* 📈 Score Visualization & Trends
* 🧠 Weak Area Detection
* 💬 AI Chat Assistant with Memory (Hindsight)
* 🔐 User Authentication
* 🌐 Full-Stack Web Application

---

## 🧠 Hindsight (Chat Memory Feature)

ScoreScope AI uses **Hindsight** to enhance chatbot intelligence:

* Stores previous interactions
* Maintains conversation context
* Provides personalized responses
* Improves accuracy over time

👉 This enables a **context-aware AI assistant** for students.

---

## 🛠️ Tech Stack

### Frontend

* React.js (Vite)
* JavaScript
* HTML / CSS

### Backend

* Django
* Django REST Framework

### Database

* SQLite / (configurable)

### AI Integration

* Groq API (LLM-based insights)

---

## 📂 Project Structure

```bash
score-scope-ai/
│
├── frontend/        # React (Vite)
├── backend/         # Django API
├── .gitignore
├── README.md
```

---

## ⚙️ Installation & Setup

### 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/ScoreScope-ai.git
cd ScoreScope-ai
```

---

### 2️⃣ Backend Setup (Django)

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

---

### 3️⃣ Frontend Setup (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

---

## 🔐 Environment Variables

Create `.env` inside backend:

```bash
GROQ_API_KEY=your_api_key_here
```

⚠️ Never push `.env` to GitHub

---

## 🚀 Usage

* Upload exam data
* Analyze performance
* Get AI-driven insights
* Chat with AI assistant
* Receive personalized suggestions using memory

---

## 👥 Team

* Daksh – Frontend & Integration
* Arpit – Backend Development (Django)
* Adesh – AI & Logic Implementation

---

## 🧠 Future Improvements

* Advanced dashboards
* Better memory optimization
* Deployment (Vercel + Render)
* Real-time analytics

---

## 📜 License

Built for hackathon and educational purposes.

---

## ⭐ Acknowledgements

* Groq API
* Open-source community
* Hackathon organizers

---
