from django.urls import path
from .views import AlarmListCreateView, AlarmDetailView, AlarmLogCreateView

urlpatterns = [
    path('', AlarmListCreateView.as_view(), name='alarm_list_create'),
    path('<int:pk>/', AlarmDetailView.as_view(), name='alarm_detail'),
    path('log-wake/', AlarmLogCreateView.as_view(), name='alarm_log_wake'),
]
