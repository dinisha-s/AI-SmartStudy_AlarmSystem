from rest_framework import views, status, permissions
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Sum, Avg, Count
from .models import StudySession
from .serializers import StudySessionSerializer, SessionStartSerializer, SessionEndSerializer

def calculate_rule_based_focus_score(self_rating, duration_minutes, breaks_taken, tab_switches):
    """Rule-Based Focus Score Calculation (0-100 continuous score)"""
    # 1. Base rating component (1-5 stars mapped to 0-100 base)
    base_score = self_rating * 20.0

    # 2. Penalty for frequent breaks (5 points per break)
    break_penalty = breaks_taken * 5.0

    # 3. Penalty for tab switching / distraction (3 points per tab switch)
    distraction_penalty = tab_switches * 3.0

    # 4. Duration stability bonus (reward sessions >= 25 mins up to 90 mins)
    duration_bonus = 0.0
    if 25 <= duration_minutes <= 90:
        duration_bonus = 5.0

    final_score = base_score - break_penalty - distraction_penalty + duration_bonus
    return max(0.0, min(100.0, round(final_score, 2)))

class StartSessionView(views.APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        serializer = SessionStartSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        session = StudySession.objects.create(
            user=request.user,
            subject=serializer.validated_data['subject'],
            start_time=timezone.now(),
            session_date=timezone.now().date()
        )

        return Response({
            'message': 'Study session started successfully.',
            'session_id': session.id,
            'subject': session.subject,
            'start_time': session.start_time
        }, status=status.HTTP_201_CREATED)

class EndSessionView(views.APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        serializer = SessionEndSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        data = serializer.validated_data
        try:
            session = StudySession.objects.get(id=data['session_id'], user=request.user)
        except StudySession.DoesNotExist:
            return Response({'error': 'Study session not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Calculate computed focus score
        computed_score = calculate_rule_based_focus_score(
            self_rating=data['focus_score_self_rated'],
            duration_minutes=data['duration_minutes'],
            breaks_taken=data['breaks_taken'],
            tab_switches=data['tab_switches']
        )

        # Update session fields
        session.end_time = timezone.now()
        session.duration_minutes = data['duration_minutes']
        session.focus_score_self_rated = data['focus_score_self_rated']
        session.breaks_taken = data['breaks_taken']
        session.tab_switches = data['tab_switches']
        session.focus_score_computed = computed_score
        session.save()

        # Update User streak counter if session >= 20 mins
        if session.duration_minutes >= 20:
            user = request.user
            user.streak += 1
            user.save()

        return Response({
            'message': 'Study session completed successfully.',
            'session': StudySessionSerializer(session).data
        }, status=status.HTTP_200_OK)

class StudyAnalyticsView(views.APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        sessions = StudySession.objects.filter(user=request.user, end_time__isnull=False)

        total_sessions = sessions.count()
        total_minutes = sessions.aggregate(total=Sum('duration_minutes'))['total'] or 0
        avg_focus = sessions.aggregate(avg=Avg('focus_score_computed'))['avg'] or 0.0

        subject_breakdown = sessions.values('subject').annotate(
            count=Count('id'),
            total_duration=Sum('duration_minutes'),
            avg_focus=Avg('focus_score_computed')
        ).order_by('-total_duration')

        return Response({
            'total_sessions': total_sessions,
            'total_study_minutes': total_minutes,
            'total_study_hours': round(total_minutes / 60.0, 1),
            'avg_focus_score': round(avg_focus, 1),
            'subject_breakdown': subject_breakdown,
            'recent_sessions': StudySessionSerializer(sessions.order_by('-start_time')[:10], many=True).data
        })
