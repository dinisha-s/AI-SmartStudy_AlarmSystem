from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.db import connection
from django.contrib.auth import get_user_model

def health_check(request):
    db_status = "ok"
    error_msg = None
    table_count = None
    try:
        connection.ensure_connection()
        User = get_user_model()
        table_count = User.objects.count()
    except Exception as e:
        db_status = "error"
        error_msg = str(e)

    return JsonResponse({
        "status": "online",
        "database": db_status,
        "users_count": table_count,
        "error": error_msg
    })

urlpatterns = [
    path('api/health/', health_check, name='health_check'),
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/alarms/', include('alarms.urls')),
    path('api/study/', include('study.urls')),
    path('api/ai/', include('ai_content.urls')),
]
