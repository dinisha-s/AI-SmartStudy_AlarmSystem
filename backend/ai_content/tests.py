from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import StudyPlan

User = get_user_model()

class AiContentAPITests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(username='aiuser', email='ai@example.com', password='Password123')
        self.client.force_authenticate(user=self.user)

    def test_generate_study_plan_endpoint(self):
        url = reverse('ai_generate_plan')
        data = {
            'exam_date': '2026-10-15',
            'syllabus_topics': ['Python Architecture', 'Django REST Framework', 'FastAPI ML'],
            'daily_hours': 4
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('generated_plan', response.data)
        self.assertEqual(response.data['generated_by'], 'gemini')
        self.assertEqual(StudyPlan.objects.count(), 1)

    def test_list_study_plans_endpoint(self):
        url = reverse('ai_plan_list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
