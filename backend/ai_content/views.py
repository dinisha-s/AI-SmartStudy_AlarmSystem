from rest_framework import views, generics, status, permissions
from rest_framework.response import Response
from django.utils import timezone
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
                }}
            ],
            "general_strategy": "Maintain 25-minute Pomodoro sessions and review flashcards before sleep."
        }}
        """

        ai_response = call_gemini_api(prompt, expected_json=True)

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

class SummarizeNotesView(views.APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        notes_text = request.data.get('notes_text', '')
        subject = request.data.get('subject', 'General Study Notes')

        if not notes_text.strip():
            return Response({'error': 'Please provide notes text to summarize.'}, status=status.HTTP_400_BAD_REQUEST)

        prompt = f"""
        You are an expert academic summarizer for top university students.
        Summarize the following study notes for subject: "{subject}".
        Extract key takeaways, core concepts, and produce a concise executive summary.

        NOTES CONTENT:
        {notes_text[:4000]}

        IMPORTANT: Return ONLY a valid raw JSON object matching this exact schema:
        {{
            "subject": "{subject}",
            "summary": "High-level summary of the notes...",
            "key_points": ["Key point 1", "Key point 2", "Key point 3"],
            "important_concepts": ["Concept 1", "Concept 2"]
        }}
        """

        ai_response = call_gemini_api(prompt, expected_json=True)

        if not ai_response:
            ai_response = {
                "subject": subject,
                "summary": f"Summary of {subject} notes. Highlights the core principles, definitions, and practical implementation patterns.",
                "key_points": [
                    "Core definitions and underlying architecture principles.",
                    "Key implementation workflows and best practices.",
                    "Common exam problem patterns and solution approaches."
                ],
                "important_concepts": ["Architecture Basics", "Implementation Lifecycle", "Optimization Strategies"]
            }

        return Response(ai_response, status=status.HTTP_200_OK)

class GenerateQuizView(views.APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        topic = request.data.get('topic', 'Python Full Stack')
        num_questions = request.data.get('num_questions', 5)

        prompt = f"""
        You are an expert academic test generator.
        Create a multiple-choice quiz with {num_questions} questions for topic: "{topic}".
        Each question must have 4 options, a correct answer, and an educational explanation.

        IMPORTANT: Return ONLY a valid raw JSON object matching this exact schema:
        {{
            "topic": "{topic}",
            "questions": [
                {{
                    "id": 1,
                    "question": "Sample Question Text",
                    "options": ["A. Option 1", "B. Option 2", "C. Option 3", "D. Option 4"],
                    "correct_answer": "B. Option 2",
                    "explanation": "Detailed explanation of why B is correct..."
                }}
            ]
        }}
        """

        ai_response = call_gemini_api(prompt, expected_json=True)

        if not ai_response or 'questions' not in ai_response:
            ai_response = {
                "topic": topic,
                "questions": [
                    {
                        "id": 1,
                        "question": f"What is a primary advantage of using Django REST Framework for API development in {topic}?",
                        "options": [
                            "A. Eliminates the need for a database",
                            "B. Built-in serializers, authentication, and ORM integration",
                            "C. Automatically writes React frontend code",
                            "D. Only supports XML data format"
                        ],
                        "correct_answer": "B. Built-in serializers, authentication, and ORM integration",
                        "explanation": "DRF provides out-of-the-box support for serializers, authentication policies, and ORM integration."
                    },
                    {
                        "id": 2,
                        "question": f"Why do we serve Machine Learning models using FastAPI in a {topic} microservice architecture?",
                        "options": [
                            "A. FastAPI is lightweight, async, and optimized for fast model inference",
                            "B. Django cannot run Python code",
                            "C. FastAPI completely replaces PostgreSQL",
                            "D. FastAPI requires no Python packages"
                        ],
                        "correct_answer": "A. FastAPI is lightweight, async, and optimized for fast model inference",
                        "explanation": "FastAPI is built on ASGI for high-performance async processing, making it ideal for ML model serving."
                    }
                ]
            }

        return Response(ai_response, status=status.HTTP_200_OK)

class DoubtChatbotView(views.APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        user_message = request.data.get('user_message', '')
        subject_context = request.data.get('subject_context', 'General Computer Science')

        if not user_message.strip():
            return Response({'error': 'Please enter a question.'}, status=status.HTTP_400_BAD_REQUEST)

        prompt = f"""
        You are a friendly, highly knowledgeable AI academic tutor specializing in: "{subject_context}".
        Answer the following student doubt clearly, concisely, and with educational depth.

        STUDENT DOUBT:
        {user_message}

        Format response directly in clean text with bullet points if helpful.
        """

        ai_response = call_gemini_api(prompt, expected_json=False)

        if not ai_response:
            ai_response = f"Here is an overview for '{user_message}':\n\n• **Core Concept**: Focus on breaking down the problem into subcomponents.\n• **Key Technique**: Verify your inputs and boundary cases.\n• **Study Recommendation**: Review chapter notes and practice code implementation."

        return Response({
            'subject_context': subject_context,
            'question': user_message,
            'reply': ai_response
        }, status=status.HTTP_200_OK)
