import requests
from datetime import timedelta
from django.conf import settings
from rest_framework import views, status, permissions
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Sum, Avg, Count
from .models import StudySession
from alarms.models import AlarmLog
from users.models import Badge
from .serializers import StudySessionSerializer, SessionStartSerializer, SessionEndSerializer

def calculate_rule_based_focus_score(self_rating, duration_minutes, breaks_taken, tab_switches):
    """Rule-Based Focus Score Calculation (0-100 continuous score)"""
    base_score = self_rating * 20.0
    break_penalty = breaks_taken * 5.0
    distraction_penalty = tab_switches * 3.0
    duration_bonus = 5.0 if 25 <= duration_minutes <= 90 else 0.0

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

        computed_score = calculate_rule_based_focus_score(
            self_rating=data['focus_score_self_rated'],
            duration_minutes=data['duration_minutes'],
            breaks_taken=data['breaks_taken'],
            tab_switches=data['tab_switches']
        )

        session.end_time = timezone.now()
        session.duration_minutes = data['duration_minutes']
        session.focus_score_self_rated = data['focus_score_self_rated']
        session.breaks_taken = data['breaks_taken']
        session.tab_switches = data['tab_switches']
        session.focus_score_computed = computed_score
        session.save()

        if session.duration_minutes >= 20:
            user = request.user
            user.streak += 1
            user.save()

        # Gamification: Evaluate Badge Unlocks
        unlocked_badges = []
        user_sessions = StudySession.objects.filter(user=request.user, end_time__isnull=False)

        if user_sessions.count() >= 1:
            b, created = Badge.objects.get_or_create(
                user=request.user, 
                badge_name='First Step'
            )
            if created: unlocked_badges.append(b.badge_name)

        if request.user.streak >= 3:
            b, created = Badge.objects.get_or_create(
                user=request.user, 
                badge_name='3-Day Streak Master'
            )
            if created: unlocked_badges.append(b.badge_name)

        if computed_score >= 85:
            b, created = Badge.objects.get_or_create(
                user=request.user, 
                badge_name='Focus Virtuoso'
            )
            if created: unlocked_badges.append(b.badge_name)

        return Response({
            'message': 'Study session completed successfully.',
            'session': StudySessionSerializer(session).data,
            'unlocked_badges': unlocked_badges
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

class DashboardAnalyticsView(views.APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        today = timezone.now().date()
        past_7_days = [today - timedelta(days=i) for i in range(6, -1, -1)]

        daily_trends = []
        for d in past_7_days:
            day_str = d.strftime('%a') # Mon, Tue, etc.
            day_sessions = StudySession.objects.filter(user=request.user, session_date=d, end_time__isnull=False)
            day_minutes = day_sessions.aggregate(total=Sum('duration_minutes'))['total'] or 0
            day_avg_focus = day_sessions.aggregate(avg=Avg('focus_score_computed'))['avg'] or 75.0

            sleep_hours = 7.5 if d.weekday() < 5 else 8.5

            daily_trends.append({
                'date': d.strftime('%Y-%m-%d'),
                'day': day_str,
                'study_hours': round(day_minutes / 60.0, 1),
                'sleep_hours': sleep_hours,
                'focus_score': round(day_avg_focus, 1)
            })

        sessions = StudySession.objects.filter(user=request.user, end_time__isnull=False)
        subject_breakdown = sessions.values('subject').annotate(value=Sum('duration_minutes')).order_by('-value')

        pie_data = [
            {'name': item['subject'] or 'General', 'value': item['value'] or 30}
            for item in subject_breakdown
        ]
        if not pie_data:
            pie_data = [
                {'name': 'Python Architecture', 'value': 120},
                {'name': 'Django REST Framework', 'value': 90},
                {'name': 'FastAPI ML', 'value': 60},
                {'name': 'React Vite', 'value': 45}
            ]

        user_badges = Badge.objects.filter(user=request.user)
        badge_list = [
            {'id': b.id, 'name': b.badge_name, 'unlocked_at': b.unlocked_at}
            for b in user_badges
        ]

        return Response({
            'streak': request.user.streak,
            'total_sessions': sessions.count(),
            'total_study_hours': round((sessions.aggregate(t=Sum('duration_minutes'))['t'] or 0) / 60.0, 1),
            'avg_focus_score': round(sessions.aggregate(a=Avg('focus_score_computed'))['a'] or 0.0, 1),
            'daily_trends': daily_trends,
            'subject_pie_chart': pie_data,
            'badges': badge_list
        }, status=status.HTTP_200_OK)

class PredictFocusScoreView(views.APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        ml_service_url = getattr(settings, 'ML_SERVICE_URL', 'http://localhost:8001')
        try:
            res = requests.post(f"{ml_service_url}/predict/focus-score", json=request.data, timeout=5)
            if res.status_code == 200:
                return Response(res.json(), status=status.HTTP_200_OK)
            return Response({'error': 'ML prediction error.'}, status=res.status_code)
        except requests.RequestException:
            return Response({
                'predicted_focus_score': 75.0,
                'score_quality': 'GOOD',
                'note': 'ML service offline. Used fallback estimate.'
            }, status=status.HTTP_200_OK)

class PredictBestSlotView(views.APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        ml_service_url = getattr(settings, 'ML_SERVICE_URL', 'http://localhost:8001')
        try:
            res = requests.post(f"{ml_service_url}/predict/best-slot", json=request.data, timeout=5)
            if res.status_code == 200:
                return Response(res.json(), status=status.HTTP_200_OK)
            return Response({'error': 'ML prediction error.'}, status=res.status_code)
        except requests.RequestException:
            return Response({
                'best_slot_id': 0,
                'best_slot_name': 'Morning',
                'recommended_time_window': '06:00 AM - 12:00 PM'
            }, status=status.HTTP_200_OK)
