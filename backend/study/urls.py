from django.urls import path
from .views import StartSessionView, EndSessionView, StudyAnalyticsView

urlpatterns = [
    path('session/start/', StartSessionView.as_view(), name='study_start'),
    path('session/end/', EndSessionView.as_view(), name='study_end'),
    path('analytics/', StudyAnalyticsView.as_view(), name='study_analytics'),
]
