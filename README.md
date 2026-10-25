# 🎓 AI-Powered Smart Study and Alarm Management System

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Vercel-success?style=for-the-badge)](https://ai-smart-study-alarm-system.vercel.app/)
[![Backend API](https://img.shields.io/badge/⚡_Django_REST-Render-blue?style=for-the-badge)](https://smartstudy-backend-ijdh.onrender.com/admin/)
[![ML Microservice](https://img.shields.io/badge/🤖_FastAPI_ML-Render-teal?style=for-the-badge)](https://smartstudy-ml-service.onrender.com/docs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

An end-to-end full-stack AI platform designed to maximize student productivity by pairing **Machine Learning predictive models** with **Google Gemini Generative AI**, **HTML5 Web Audio tone synthesis**, and **SuperMemo SM-2 spaced repetition**.

---

## 🌐 Live Demo & Recruiter Access

- 🔗 **Public Live Application**: [https://ai-smart-study-alarm-system.vercel.app](https://ai-smart-study-alarm-system.vercel.app/)
- ⚡ **Backend API Endpoint**: [https://smartstudy-backend-ijdh.onrender.com/api/](https://smartstudy-backend-ijdh.onrender.com/api/)
- 🤖 **FastAPI ML Swagger Docs**: [https://smartstudy-ml-service.onrender.com/docs](https://smartstudy-ml-service.onrender.com/docs)
- 🔑 **Recruiter Test Account**:
  - **Email**: `recruiter@smartstudy.ai`
  - **Password**: `DemoUser123!`

---

## 🌟 Key Features

### 🧠 1. Machine Learning & Predictive Analytics Microservice (FastAPI)
- **Model 1: Snooze Risk Predictor (`RandomForestClassifier`)** — Evaluates historical wake logs and sleep duration to estimate snooze probability ($0.0 - 1.0$) and dynamically enforces math puzzle dismissals for high-risk alarms (Accuracy: 94.00%).
- **Model 2: Focus Score Estimator (`RandomForestRegressor`)** — Estimates post-session cognitive focus scores ($0.0 - 100.0$) using duration, break frequency, time of day, and tab switches ($R^2 = 0.9417$, MAE = 4.16).
- **Model 3: Optimal Study Slot Recommender (`RandomForestClassifier`)** — Recommends optimal study times (Morning, Afternoon, Evening, Night) based on subject type and historical focus trends.

### 🤖 2. Google Gemini 2.5 Flash Generative AI Suite
- **AI Study Plan Generator**: Generates day-by-day exam schedules from syllabus topics and target dates with strict JSON schema validation.
- **AI Notes Summarizer**: Converts textbook passages and study notes into executive summaries, key bullet points, and core concepts.
- **AI MCQ Quiz Generator**: Auto-generates multiple-choice quizzes with options, answer keys, and explanations.
- **AI Academic Doubt Chatbot**: Subject-aware conversational assistant for instant academic doubt solving.

### ⏰ 3. Smart Alarm System & Web Audio Synthesizer
- Progressive tone synthesis using HTML5 Web Audio API (`AudioContext`, `OscillatorNode`, `GainNode`).
- Mental math puzzle modal (Framer Motion) forced when ML predicts high snooze risk.
- Automatic wake log telemetry sent to backend.

### ⏱️ 4. Focus Session Tracker & Tab Distraction Detection
- Real-time Pomodoro study timer with pause/resume and break counter.
- HTML5 Page Visibility API (`visibilitychange` event) tracking tab switches and off-screen distractions.
- Rule-based continuous focus score computation engine.

### 🎴 5. Spaced Repetition Flashcards (SuperMemo SM-2)
- Implements the SuperMemo SM-2 algorithm to schedule memory revision dates based on quality ratings ($0 - 5$).
- Interactive 3D flip card UI in React.

### 📊 6. Interactive Analytics & Gamification
- Recharts visualizations: 7-Day Focus Score Trend, Sleep vs. Study Hours correlation, and Subject Time Distribution.
- Automated gamification engine rewarding streak milestones and focus accomplishments with badges.

---

## 🏗️ System Architecture

```mermaid
graph TD
    Client["React 19 + Vite 8 Frontend (Vercel)<br/>Tailwind CSS v4 + Framer Motion + Recharts"]
    
    subgraph Django_Backend ["Django REST Framework API (Render)"]
        AuthModule["JWT Auth (SimpleJWT)"]
        StudyModule["Study Tracker & Focus Engine"]
        AlarmModule["Smart Alarm Manager"]
        AiModule["Gemini 2.5 Flash Integration Engine"]
        ProxyModule["ML Microservice HTTP Proxy"]
    end

    subgraph ML_Microservice ["FastAPI ML Service (Render)"]
        M1["Model 1: Snooze Risk Classifier"]
        M2["Model 2: Focus Score Regressor"]
        M3["Model 3: Slot Recommender Classifier"]
    end

    subgraph Data_Layer ["Data & Storage Layer"]
        PostgreSQL[("Neon Serverless PostgreSQL Database")]
        Redis[("Redis Task Queue Broker")]
    end

    GeminiAPI["Google Gemini 2.5 Flash API"]

    Client -->|REST JSON + JWT Bearer| Django_Backend
    Django_Backend -->|ORM Queries| PostgreSQL
    Django_Backend -->|Celery Tasks| Redis
    Django_Backend -->|HTTP JSON POST| ML_Microservice
    Django_Backend -->|google-genai SDK| GeminiAPI
    ML_Microservice -->|joblib load .pkl| M1
    ML_Microservice -->|joblib load .pkl| M2
    ML_Microservice -->|joblib load .pkl| M3
```

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS v4, Framer Motion, Recharts, Lucide Icons, Axios |
| **Backend API** | Python 3.11, Django 5.1, Django REST Framework, SimpleJWT Authentication, WhiteNoise, Gunicorn |
| **ML Microservice** | FastAPI, Uvicorn, Scikit-Learn, Joblib, NumPy, Pandas |
| **GenAI Engine** | Google Gemini 2.5 Flash (`google-genai` SDK) |
| **Database** | Serverless PostgreSQL (Neon.tech) |
| **Deployment** | Vercel (Frontend), Render (Backend & ML Microservice) |

---

## ⚙️ Local Installation & Setup

1. **Clone Repository**:
   ```bash
   git clone https://github.com/dinisha-s/AI-SmartStudy_AlarmSystem.git
   cd AI-SmartStudy_AlarmSystem
   ```
2. **Backend Setup (Django REST Framework)**:
   ```bash
   cd backend
   python -m venv venv
   venv\Scripts\activate   # Windows
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py runserver 8000
   ```
3. **ML Microservice Setup (FastAPI)**:
   ```bash
   cd ml-service
   python -m venv venv
   venv\Scripts\activate   # Windows
   pip install -r requirements.txt
   uvicorn main:app --host 0.0.0.0 --port 8001 --reload
   ```
4. **Frontend Setup (React Vite)**:
   ```bash
   cd client
   npm install
   npm run dev
   ```

---

## 🧪 Automated Test Suites

### Django REST Backend Unit Tests:
```bash
cd backend
python manage.py test
```

### FastAPI Microservice Pytest Suite:
```bash
cd ml-service
pytest
```

---

## 📜 API Endpoint Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register/` | Register new user account |
| `POST` | `/api/auth/login/` | Authenticate & acquire JWT access/refresh tokens |
| `GET` | `/api/alarms/` | List user alarms |
| `POST` | `/api/alarms/predict/snooze-risk/` | Proxy prediction request to FastAPI Snooze Risk Model |
| `POST` | `/api/study/session/start/` | Initialize live study session timer |
| `POST` | `/api/study/session/end/` | Finalize study session & compute focus score |
| `GET` | `/api/study/analytics/dashboard/` | Return Recharts analytics data & unlocked badges |
| `POST` | `/api/ai/generate-plan/` | Generate Gemini AI day-wise study schedule |
| `POST` | `/api/ai/summarize-notes/` | Summarize notes using Gemini 2.5 Flash |
| `POST` | `/api/ai/generate-quiz/` | Auto-generate multiple-choice quiz questions |
| `POST` | `/api/ai/chatbot/` | Academic doubt-solving AI tutor |
| `POST` | `/api/ai/flashcards/<id>/review/` | Submit SM-2 spaced repetition card review rating |

---

## 📄 License
Distributed under the MIT License.
