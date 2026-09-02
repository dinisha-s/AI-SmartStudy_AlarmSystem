from rest_framework import serializers
from .models import StudyPlan, Flashcard

class StudyPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudyPlan
        fields = ('id', 'exam_date', 'syllabus_topics', 'generated_plan', 'generated_by', 'created_at')
        read_only_fields = ('id', 'created_at')

class GeneratePlanRequestSerializer(serializers.Serializer):
    exam_date = serializers.DateField()
    syllabus_topics = serializers.ListField(child=serializers.CharField(max_length=150), min_length=1)
    daily_hours = serializers.IntegerField(min_value=1, max_value=16, default=4)
