from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from django.contrib.auth import get_user_model
from django.core.mail import send_mail
from .models import StudySession

User = get_user_model()

@shared_task
def send_weekly_study_report_email(user_id):
    """Asynchronously generates and emails weekly study performance report."""
    try:
        user = User.objects.get(id=user_id)
        one_week_ago = timezone.now().date() - timedelta(days=7)
        sessions = StudySession.objects.filter(user=user, session_date__gte=one_week_ago, end_time__isnull=False)

        total_sessions = sessions.count()
        total_minutes = sum(s.duration_minutes for s in sessions)

        subject = "Your SmartStudy Weekly Analytics Report"
        message = f"Hello {user.username},\n\nHere is your 7-day study summary:\n- Sessions Completed: {total_sessions}\n- Total Time Studied: {round(total_minutes / 60.0, 1)} hours\n- Current Streak: {user.streak} days\n\nKeep up the great momentum!"

        send_mail(
            subject=subject,
            message=message,
            from_email="no-reply@smartstudy.ai",
            recipient_list=[user.email],
            fail_silently=True
        )
        return f"Weekly report email dispatched to {user.email}"
    except User.DoesNotExist:
        return f"User ID {user_id} not found."

@shared_task
def check_and_reset_inactive_streaks():
    """Periodic task: resets streaks for users inactive for >48 hours."""
    two_days_ago = timezone.now().date() - timedelta(days=2)
    users = User.objects.filter(streak__gt=0)
    reset_count = 0

    for u in users:
        last_session = StudySession.objects.filter(user=u, end_time__isnull=False).order_by('-session_date').first()
        if not last_session or last_session.session_date < two_days_ago:
            u.streak = 0
            u.save()
            reset_count += 1

    return f"Checked streak inactivity. Reset {reset_count} user streaks."
