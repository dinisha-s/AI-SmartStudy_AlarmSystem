from django.urls import path
from .views import (
    StartSessionView, 
    EndSessionView, 
    StudyAnalyticsView, 
    DashboardAnalyticsView,
    PredictFocusScoreView, 
    PredictBestSlotView
)

urlpatterns = [
    path('session/start/', StartSessionView.as_view(), name='study_start'),
    path('session/end/', EndSessionView.as_view(), name='study_end'),
    path('analytics/', StudyAnalyticsView.as_view(), name='study_analytics'),
    path('analytics/dashboard/', DashboardAnalyticsView.as_view(), name='dashboard_analytics'),
    path('predict/focus-score/', PredictFocusScoreView.as_view(), name='study_predict_focus'),
    path('predict/best-slot/', PredictBestSlotView.as_view(), name='study_predict_slot'),
]
