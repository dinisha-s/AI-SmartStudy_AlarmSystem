import requests
from django.conf import settings
from rest_framework import generics, permissions, views, status
from rest_framework.response import Response
from .models import Alarm, AlarmLog
from .serializers import AlarmSerializer, AlarmLogSerializer

class AlarmListCreateView(generics.ListCreateAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = AlarmSerializer

    def get_queryset(self):
        return Alarm.objects.filter(user=self.request.user).order_by('time')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class AlarmDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = AlarmSerializer

    def get_queryset(self):
        return Alarm.objects.filter(user=self.request.user)

class AlarmLogCreateView(generics.CreateAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = AlarmLogSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class SnoozeRiskPredictView(views.APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        user = request.user
        
        # Calculate features from user DB history or request data
        hour_of_alarm = request.data.get('hour_of_alarm', 6)
        day_of_week = request.data.get('day_of_week', 1)
        sleep_duration = request.data.get('sleep_duration_prev_night', 7.0)
        self_energy = request.data.get('self_reported_energy', 3)

        # Count total snoozes in past 7 days from AlarmLog
        past_7_logs = AlarmLog.objects.filter(user=user)
        recent_snooze_sum = sum(log.snooze_count for log in past_7_logs)

        ml_payload = {
            "hour_of_alarm": int(hour_of_alarm),
            "day_of_week": int(day_of_week),
            "sleep_duration_prev_night": float(sleep_duration),
            "snooze_count_last_7_days": recent_snooze_sum,
            "study_session_pending": 1,
            "self_reported_energy": int(self_energy)
        }

        # Call FastAPI ML Microservice
        ml_service_url = getattr(settings, 'ML_SERVICE_URL', 'http://localhost:8001')
        try:
            res = requests.post(f"{ml_service_url}/predict/snooze-risk", json=ml_payload, timeout=5)
            if res.status_code == 200:
                return Response(res.json(), status=status.HTTP_200_OK)
            return Response({'error': 'ML prediction service returned error.'}, status=res.status_code)
        except requests.RequestException as err:
            # Fallback if ML microservice is unreachable
            return Response({
                'snooze_risk': 0.50,
                'risk_level': 'MEDIUM',
                'require_math_puzzle': False,
                'recommendation': 'ML Service unreachable. Using fallback medium risk prediction.'
            }, status=status.HTTP_200_OK)
