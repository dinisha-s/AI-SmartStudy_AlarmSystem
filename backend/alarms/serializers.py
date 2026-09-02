from rest_framework import serializers
from .models import Alarm, AlarmLog

class AlarmSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alarm
        fields = ('id', 'title', 'time', 'is_active', 'days_of_week', 'require_math_puzzle', 'created_at')
        read_only_fields = ('id', 'created_at')

class AlarmLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AlarmLog
        fields = ('id', 'alarm_set_time', 'actual_wake_time', 'snooze_count', 'sleep_duration_prev_night', 'dismiss_method', 'log_date')
        read_only_fields = ('id',)
