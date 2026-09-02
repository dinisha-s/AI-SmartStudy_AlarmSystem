from django.db import models
from django.conf import settings

class StudyPlan(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='study_plans')
    exam_date = models.DateField()
    syllabus_topics = models.JSONField(default=list)
    generated_plan = models.JSONField(default=dict)
    generated_by = models.CharField(max_length=50, default='gemini')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Study Plan for {self.user.email} (Exam: {self.exam_date})"

class Flashcard(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='flashcards')
    topic = models.CharField(max_length=150, null=True, blank=True)
    question = models.TextField()
    answer = models.TextField()
    next_review_date = models.DateField(null=True, blank=True)
    review_interval = models.PositiveIntegerField(default=1) # days
    easiness_factor = models.DecimalField(max_digits=4, decimal_places=2, default=2.50) # SM-2 EF
    repetitions = models.PositiveIntegerField(default=0) # SM-2 repetition count
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Flashcard ({self.topic or 'General'}) - {self.user.email}"
