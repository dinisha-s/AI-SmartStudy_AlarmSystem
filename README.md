# AI-Powered Smart Study & Alarm Management System

A smart productivity platform combining study session tracking with an adaptive alarm system powered by custom ML models + Google Gemini API.

## Architecture

- **Frontend (`client/`)**: React (Vite) + Tailwind CSS + Framer Motion + Recharts
- **Core Backend (`backend/`)**: Django REST Framework + PostgreSQL + SimpleJWT
- **ML Microservice (`ml-service/`)**: FastAPI + scikit-learn + XGBoost + joblib
- **Background Processing**: Celery + Celery Beat + Redis

## Project Structure

```
smart-study-alarm/
├── client/              # React Frontend (Vite)
├── backend/             # Django REST Framework Backend
├── ml-service/          # FastAPI ML Inference Microservice
├── admin-dashboard/     # Streamlit Admin Analytics Dashboard
├── .gitignore
├── .env.example
└── README.md
```

## Setup Instructions

*(Detailed setup instructions will be updated per phase)*
