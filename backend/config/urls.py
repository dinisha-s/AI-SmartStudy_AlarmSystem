from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/alarms/', include('alarms.urls')),
    path('api/study/', include('study.urls')),
    path('api/ai/', include('ai_content.urls')),
]
