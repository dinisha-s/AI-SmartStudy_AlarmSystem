from rest_framework import views, generics, status, permissions
from rest_framework.response import Response
from django.utils import timezone
from datetime import datetime
from .models import StudyPlan
from .serializers import StudyPlanSerializer, GeneratePlanRequestSerializer
from .utils.gemini_client import call_gemini_api

class GenerateStudyPlanView(views.APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        serializer = GeneratePlanRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        exam_date = data['exam_date']
        topics = data['syllabus_topics']
        daily_hours = data['daily_hours']

        # Construct structured JSON prompt for Gemini API
        prompt = f"""
        You are an elite academic study strategist.
        Create a day-by-day study schedule for an upcoming exam on {exam_date}.
        Syllabus topics to cover: {', '.join(topics)}.
        Available daily study time: {daily_hours} hours.

        IMPORTANT: Return ONLY a valid raw JSON object (no markdown, no code blocks) matching this exact schema:
        {{
            "plan_title": "AI Study Schedule for Exam on {exam_date}",
            "total_topics": {len(topics)},
            "daily_hours_allocated": {daily_hours},
            "schedule": [
                {{
                    "day": 1,
                    "focus_topic": "{topics[0] if topics else 'Core Concepts'}",
                    "subtopics": ["Fundamentals", "Key Definitions"],
                    "allocated_hours": {daily_hours},
                    "action_item": "Complete notes review and practice 5 sample questions"
                }},
                {{
                    "day": 2,
                    "focus_topic": "{topics[1] if len(topics) > 1 else 'Advanced Topics'}",
                    "subtopics": ["Application", "Problem Solving"],
                    "allocated_hours": {daily_hours},
                    "action_item": "Solve past exam paper problems"
                }}
            ],
            "general_strategy": "Maintain 25-minute Pomodoro sessions and review flashcards before sleep."
        }}
        """

        # Call Gemini API SDK helper
        ai_response = call_gemini_api(prompt, expected_json=True)

        # Fallback structured plan if API key is not configured locally
        if not ai_response:
            ai_response = {
                "plan_title": f"Study Schedule for Exam on {exam_date}",
                "total_topics": len(topics),
                "daily_hours_allocated": daily_hours,
                "schedule": [
                    {
                        "day": idx + 1,
                        "focus_topic": topic,
                        "subtopics": [f"{topic} Fundamentals", f"{topic} Practice Problems"],
                        "allocated_hours": daily_hours,
                        "action_item": f"Review core notes and create flashcards for {topic}."
                    }
                    for idx, topic in enumerate(topics)
                ],
                "general_strategy": "Focus on high-yield topics and take short adaptive breaks."
            }

        # Save generated plan to PostgreSQL
        study_plan = StudyPlan.objects.create(
            user=request.user,
            exam_date=exam_date,
            syllabus_topics=topics,
            generated_plan=ai_response,
            generated_by="gemini"
        )

        return Response(StudyPlanSerializer(study_plan).data, status=status.HTTP_201_CREATED)

class StudyPlanListView(generics.ListAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = StudyPlanSerializer

    def get_queryset(self):
        return StudyPlan.objects.filter(user=self.request.user).order_by('-created_at')
