from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import StudySession

User = get_user_model()

class StudySessionAPITests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(username='studyuser', email='study@example.com', password='Password123')
        self.client.force_authenticate(user=self.user)

    def test_start_and_end_study_session(self):
        start_url = reverse('study_start')
        start_response = self.client.post(start_url, {'subject': 'Python Backend Architecture'}, format='json')
        self.assertEqual(start_response.status_code, status.HTTP_201_CREATED)
        self.assertIn('session_id', start_response.data)
        session_id = start_response.data['session_id']

        end_url = reverse('study_end')
        end_data = {
            'session_id': session_id,
            'duration_minutes': 45,
            'focus_score_self_rated': 4,
            'breaks_taken': 1,
            'tab_switches': 2
        }
        end_response = self.client.post(end_url, end_data, format='json')
        self.assertEqual(end_response.status_code, status.HTTP_200_OK)
        self.assertEqual(float(end_response.data['session']['focus_score_computed']), 74.0)

    def test_study_analytics_endpoint(self):
        url = reverse('study_analytics')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total_study_hours', response.data)

    def test_predict_focus_score_proxy(self):
        url = reverse('study_predict_focus')
        data = {
            'session_duration': 45,
            'breaks_taken': 1,
            'time_of_day_hour': 10,
            'tab_switches': 2,
            'self_rating': 4
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('predicted_focus_score', response.data)

    def test_predict_best_slot_proxy(self):
        url = reverse('study_predict_slot')
        data = {
            'subject_type': 1, # Numerical / Math
            'avg_focus_history': 85.0
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('best_slot_name', response.data)
