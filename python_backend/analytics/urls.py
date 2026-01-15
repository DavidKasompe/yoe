from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenRefreshView,
)
from .views import MatchViewSet, TeamViewSet, IngestMatchView, RegisterView, UserMeView, LoginView, LogoutView, AuditLogViewSet, AdminSecurityEventsView, AdminUserManagementViewSet, OAuthCallbackView, OAuthUrlView

router = DefaultRouter()
router.register(r'matches', MatchViewSet)
router.register(r'teams', TeamViewSet)
router.register(r'admin/audit-logs', AuditLogViewSet, basename='audit_logs')
router.register(r'admin/users', AdminUserManagementViewSet, basename='admin_users')

urlpatterns = [
    path('', include(router.urls)),
    path('ingest/', IngestMatchView.as_view(), name='ingest_match'),
    path('auth/register/', RegisterView.as_view(), name='auth_register'),
    path('auth/login/', LoginView.as_view(), name='auth_login'),
    path('auth/logout/', LogoutView.as_view(), name='auth_logout'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/oauth/url/', OAuthUrlView.as_view(), name='oauth_url'),
    path('auth/oauth/callback/', OAuthCallbackView.as_view(), name='oauth_callback'),
    path('users/me/', UserMeView.as_view(), name='user_me'),
    path('admin/security-events/', AdminSecurityEventsView.as_view(), name='admin_security_events'),
]
