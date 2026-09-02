from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Badge

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'streak', 'daily_study_hours', 'wake_window_start', 'wake_window_end', 'created_at')
        read_only_fields = ('id', 'created_at')

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    password_confirm = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ('email', 'username', 'password', 'password_confirm', 'wake_window_start', 'wake_window_end', 'daily_study_hours')

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        return data

    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=password,
            wake_window_start=validated_data.get('wake_window_start'),
            wake_window_end=validated_data.get('wake_window_end'),
            daily_study_hours=validated_data.get('daily_study_hours', 4)
        )
        return user

class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = ('id', 'badge_name', 'unlocked_at')
