from django.urls import path
from .views import (
    GenerateStudyPlanView, 
    StudyPlanListView, 
    SummarizeNotesView, 
    GenerateQuizView, 
    DoubtChatbotView,
    FlashcardListCreateView,
    FlashcardReviewView
)

urlpatterns = [
    path('generate-plan/', GenerateStudyPlanView.as_view(), name='ai_generate_plan'),
    path('plans/', StudyPlanListView.as_view(), name='ai_plan_list'),
    path('summarize-notes/', SummarizeNotesView.as_view(), name='ai_summarize_notes'),
    path('generate-quiz/', GenerateQuizView.as_view(), name='ai_generate_quiz'),
    path('chatbot/', DoubtChatbotView.as_view(), name='ai_chatbot'),
    path('flashcards/', FlashcardListCreateView.as_view(), name='flashcard_list_create'),
    path('flashcards/<int:pk>/review/', FlashcardReviewView.as_view(), name='flashcard_review'),
]
