from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model

User = get_user_model()

class AuthAPITests(APITestCase):

    def test_user_registration(self):
        url = reverse('auth_register')
        data = {
            'email': 'student@example.com',
            'username': 'student_dev',
            'password': 'StrongPassword123',
            'password_confirm': 'StrongPassword123',
            'daily_study_hours': 5
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['email'], 'student@example.com')

    def test_user_login(self):
        User.objects.create_user(username='testuser', email='test@example.com', password='Password123')
        url = reverse('auth_login')
        data = {'email': 'test@example.com', 'password': 'Password123'}
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)

    def test_protected_profile_endpoint(self):
        user = User.objects.create_user(username='profileuser', email='profile@example.com', password='Password123')
        self.client.force_authenticate(user=user)
        url = reverse('auth_me')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['email'], 'profile@example.com')
