from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import Alarm, AlarmLog

User = get_user_model()

class AlarmAPITests(APITestCase):

    def setUp(self):
        self.user = User.objects.create_user(username='alarmuser', email='alarm@example.com', password='Password123')
        self.client.force_authenticate(user=self.user)

    def test_create_and_list_alarm(self):
        url = reverse('alarm_list_create')
        data = {
            'title': 'Morning Exam Study',
            'time': '06:30:00',
            'is_active': True,
            'days_of_week': ['Mon', 'Wed', 'Fri'],
            'require_math_puzzle': True
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'Morning Exam Study')

        list_response = self.client.get(url)
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_response.data), 1)

    def test_log_wake_event(self):
        url = reverse('alarm_log_wake')
        data = {
            'alarm_set_time': '06:30:00',
            'actual_wake_time': '06:35:00',
            'snooze_count': 1,
            'sleep_duration_prev_night': 7.5,
            'dismiss_method': 'math_puzzle',
            'log_date': '2026-09-02'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(AlarmLog.objects.count(), 1)

    def test_predict_snooze_risk_endpoint(self):
        url = reverse('alarm_predict_snooze_risk')
        data = {
            'hour_of_alarm': 6,
            'day_of_week': 1,
            'sleep_duration_prev_night': 6.5,
            'self_reported_energy': 3
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('snooze_risk', response.data)
        self.assertIn('risk_level', response.data)
