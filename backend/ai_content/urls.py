from django.urls import path
from .views import GenerateStudyPlanView, StudyPlanListView

urlpatterns = [
    path('generate-plan/', GenerateStudyPlanView.as_view(), name='ai_generate_plan'),
    path('plans/', StudyPlanListView.as_view(), name='ai_plan_list'),
]
