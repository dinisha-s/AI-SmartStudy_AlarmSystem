from datetime import timedelta
from rest_framework import views, generics, status, permissions
from rest_framework.response import Response
from django.utils import timezone
from .models import StudyPlan, Flashcard
from .serializers import StudyPlanSerializer, GeneratePlanRequestSerializer, FlashcardSerializer
from .utils.gemini_client import call_gemini_api

def calculate_sm2_review(flashcard, quality_rating):
    """
    SuperMemo-2 (SM-2) Spaced Repetition Algorithm implementation.
    quality_rating: integer from 0 (blackout) to 5 (perfect recall).
    """
    q = max(0, min(5, int(quality_rating)))
    ef = float(flashcard.easiness_factor)
    reps = flashcard.repetitions
    interval = flashcard.review_interval

    if q < 3:
        # Failed recall: reset repetitions and interval to 1 day
        reps = 0
        interval = 1
    else:
        # Successful recall: increment repetitions and compute next interval
        if reps == 0:
            interval = 1
        elif reps == 1:
            interval = 6
        else:
            interval = max(1, round(interval * ef))
        reps += 1

    # Update Easiness Factor (EF)
    new_ef = ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    new_ef = max(1.30, round(new_ef, 2))

    next_date = timezone.now().date() + timedelta(days=interval)

    flashcard.easiness_factor = new_ef
    flashcard.repetitions = reps
    flashcard.review_interval = interval
    flashcard.next_review_date = next_date
    flashcard.save()

    return flashcard

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
            ai_response = f"Here is an overview for '{user_message}':\n\n• **Core Concept**: Focus on breaking down the problem into subcomponents.\n• **Key Technique**: Verify your inputs and boundary cases."

        return Response({
            'subject_context': subject_context,
            'question': user_message,
            'reply': ai_response
        }, status=status.HTTP_200_OK)

class FlashcardListCreateView(generics.ListCreateAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = FlashcardSerializer

    def get_queryset(self):
        return Flashcard.objects.filter(user=self.request.user).order_by('next_review_date')

    def perform_create(self, serializer):
        serializer.save(
            user=self.request.user,
            next_review_date=timezone.now().date(),
            review_interval=1,
            easiness_factor=2.50,
            repetitions=0
        )

class FlashcardReviewView(views.APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, pk):
        try:
            flashcard = Flashcard.objects.get(pk=pk, user=request.user)
        except Flashcard.DoesNotExist:
            return Response({'error': 'Flashcard not found.'}, status=status.HTTP_404_NOT_FOUND)

        rating = request.data.get('rating', 3)
        updated_card = calculate_sm2_review(flashcard, rating)

        return Response({
            'message': 'Flashcard review recorded via SM-2 algorithm.',
            'flashcard': FlashcardSerializer(updated_card).data
        }, status=status.HTTP_200_OK)
