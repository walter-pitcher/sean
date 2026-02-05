"""
Trutim API URLs
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from . import views
from .ai_views import AIChatView

router = DefaultRouter()
router.register('users', views.UserViewSet, basename='user')
router.register('rooms', views.RoomViewSet, basename='room')
router.register('messages', views.MessageViewSet, basename='message')

urlpatterns = [
    path('auth/register/', views.RegisterView.as_view()),
    path('auth/login/', views.CustomTokenObtainPairView.as_view()),
    path('auth/refresh/', TokenRefreshView.as_view()),
    path('ai/chat/', AIChatView.as_view()),
    path('', include(router.urls)),
]
