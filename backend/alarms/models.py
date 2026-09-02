from django.db import models
from django.conf import settings

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
