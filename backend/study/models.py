from django.db import models
from django.conf import settings

class StudySession(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='study_sessions')
    subject = models.CharField(max_length=100)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True, blank=True)
    duration_minutes = models.PositiveIntegerField(null=True, blank=True)
    focus_score_self_rated = models.PositiveSmallIntegerField(null=True, blank=True)
    breaks_taken = models.PositiveIntegerField(default=0)
    tab_switches = models.PositiveIntegerField(default=0)
    focus_score_computed = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    session_date = models.DateField()

    def __str__(self):
        return f"{self.subject} ({self.duration_minutes or 0} mins) - {self.user.email}"
