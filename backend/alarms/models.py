from django.db import models
from django.conf import settings

class Alarm(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='alarms')
    title = models.CharField(max_length=100, default='Morning Study Wakeup')
    time = models.TimeField()
    is_active = models.BooleanField(default=True)
    days_of_week = models.JSONField(default=list)  # e.g., ["Mon", "Tue", "Wed", "Thu", "Fri"]
    require_math_puzzle = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.time}) - {self.user.email}"

class AlarmLog(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='alarm_logs')
    alarm_set_time = models.TimeField()
    actual_wake_time = models.TimeField(null=True, blank=True)
    snooze_count = models.PositiveIntegerField(default=0)
    sleep_duration_prev_night = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    dismiss_method = models.CharField(max_length=50, null=True, blank=True, default='normal')
    log_date = models.DateField()

    def __str__(self):
        return f"Alarm {self.alarm_set_time} - {self.user.email} ({self.log_date})"
