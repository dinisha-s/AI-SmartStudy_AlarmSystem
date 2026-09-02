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

    def test_summarize_notes_endpoint(self):
        url = reverse('ai_summarize_notes')
        data = {
            'notes_text': 'Django REST Framework serializers convert complex querysets to JSON representation.',
            'subject': 'Django REST Framework'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('summary', response.data)
        self.assertIn('key_points', response.data)

    def test_generate_quiz_endpoint(self):
        url = reverse('ai_generate_quiz')
        data = {
            'topic': 'Python Full Stack',
            'num_questions': 2
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('questions', response.data)

    def test_doubt_chatbot_endpoint(self):
        url = reverse('ai_chatbot')
        data = {
            'user_message': 'What is the difference between Django and FastAPI?',
            'subject_context': 'Python Web Frameworks'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('reply', response.data)
