from django.urls import path
from .views import (
    GenerateStudyPlanView, 
    StudyPlanListView, 
    SummarizeNotesView, 
    GenerateQuizView, 
    DoubtChatbotView
)

urlpatterns = [
    path('generate-plan/', GenerateStudyPlanView.as_view(), name='ai_generate_plan'),
    path('plans/', StudyPlanListView.as_view(), name='ai_plan_list'),
    path('summarize-notes/', SummarizeNotesView.as_view(), name='ai_summarize_notes'),
    path('generate-quiz/', GenerateQuizView.as_view(), name='ai_generate_quiz'),
    path('chatbot/', DoubtChatbotView.as_view(), name='ai_chatbot'),
]
