from rest_framework import serializers
from .models import StudySession

class StudySessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudySession
        fields = (
            'id', 'subject', 'start_time', 'end_time', 
            'duration_minutes', 'focus_score_self_rated', 
            'breaks_taken', 'tab_switches', 'focus_score_computed', 'session_date'
        )
        read_only_fields = ('id', 'focus_score_computed')

class SessionStartSerializer(serializers.Serializer):
    subject = serializers.CharField(max_length=100)

class SessionEndSerializer(serializers.Serializer):
    session_id = serializers.IntegerField()
    duration_minutes = serializers.IntegerField(min_value=1)
    focus_score_self_rated = serializers.IntegerField(min_value=1, max_value=5)
    breaks_taken = serializers.IntegerField(min_value=0, default=0)
    tab_switches = serializers.IntegerField(min_value=0, default=0)
