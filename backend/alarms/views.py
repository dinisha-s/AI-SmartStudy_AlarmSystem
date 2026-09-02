from rest_framework import generics, permissions
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
