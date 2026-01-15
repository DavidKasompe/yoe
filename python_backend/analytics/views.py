from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework import viewsets, status, generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Match, Team, AuditLog, UserProfile
from .serializers import MatchSerializer, TeamSerializer, UserSerializer, RegisterSerializer, AuditLogSerializer
from .services.grid_service import GridService
from .services.analytics import AnalyticsService

def log_event(user, event_type, description, request=None):
    ip = None
    ua = None
    if request:
        ip = request.META.get('REMOTE_ADDR')
        ua = request.META.get('HTTP_USER_AGENT')
    AuditLog.objects.create(
        user=user,
        event_type=event_type,
        description=description,
        ip_address=ip,
        user_agent=ua
    )

class LoginView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        
        # Try authenticating with username
        user = authenticate(username=username, password=password)
        
        # If not found, try authenticating with email
        if not user and username and '@' in username:
            try:
                user_obj = User.objects.get(email=username)
                user = authenticate(username=user_obj.username, password=password)
            except User.DoesNotExist:
                pass

        if user:
            refresh = RefreshToken.for_user(user)
            log_event(user, 'LOGIN', 'User logged in successfully', request)
            return Response({
                "user": UserSerializer(user).data,
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            })
        log_event(None, 'ACCESS_DENIED', f'Failed login attempt for username: {username}', request)
        return Response({"error": "Invalid Credentials"}, status=status.HTTP_401_UNAUTHORIZED)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        log_event(user, 'REGISTER', 'User registered successfully', request)
        return Response({
            "user": UserSerializer(user, context=self.get_serializer_context()).data,
            "token": str(refresh.access_token),
            "refreshToken": str(refresh),
            "access": str(refresh.access_token),
            "refresh": str(refresh),
            "expires_in": 3600
        }, status=status.HTTP_201_CREATED)

class LogoutView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    
    def post(self, request):
        try:
            refresh_token = request.data.get("refresh")
            token = RefreshToken(refresh_token)
            token.blacklist()
            log_event(request.user, 'LOGOUT', 'User logged out', request)
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception:
            return Response(status=status.HTTP_400_BAD_REQUEST)

class UserMeView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.all().order_by('-timestamp')
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.profile.role == 'Admin':
            return AuditLog.objects.all().order_by('-timestamp')
        return AuditLog.objects.filter(user=self.request.user).order_by('-timestamp')

class AdminSecurityEventsView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        if request.user.profile.role != 'Admin':
            return Response({"error": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        
        # Summary of security events
        recent_logs = AuditLog.objects.all().order_by('-timestamp')[:50]
        summary = {
            "total_events": AuditLog.objects.count(),
            "failed_logins": AuditLog.objects.filter(event_type='ACCESS_DENIED').count(),
            "recent_events": AuditLogSerializer(recent_logs, many=True).data
        }
        return Response(summary)

class AdminUserManagementViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.profile.role != 'Admin':
            return User.objects.none()
        return User.objects.all()

class OAuthCallbackView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        provider = request.data.get('provider')
        code = request.data.get('code')
        
        # MOCK OAuth verification logic
        # In a real app, you would exchange 'code' for an access token with Google/Discord
        email = f"oauth_{provider}@example.com"
        username = f"{provider}_user"
        
        user, created = User.objects.get_or_create(
            username=username,
            defaults={'email': email, 'first_name': provider.capitalize(), 'last_name': 'User'}
        )
        
        if created:
            UserProfile.objects.get_or_create(user=user, defaults={'role': 'Coach'})
            log_event(user, 'REGISTER', f'User registered via {provider} OAuth', request)
        
        refresh = RefreshToken.for_user(user)
        log_event(user, 'OAUTH_LOGIN', f'User logged in via {provider} OAuth', request)
        
        return Response({
            "user": UserSerializer(user).data,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        })

class OAuthUrlView(APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request):
        provider = request.query_params.get('provider')
        # MOCK OAuth URL generation
        mock_url = f"https://accounts.{provider}.com/o/oauth2/v2/auth?client_id=mock_id&response_type=code&scope=email%20profile"
        return Response({
            "url": mock_url,
            "state": "mock_state_123"
        })

class MatchViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Match.objects.all().order_by('-date')
    serializer_class = MatchSerializer

    @action(detail=True, methods=['post'])
    def analyze(self, request, pk=None):
        """
        Trigger re-analysis of a match manually.
        """
        match = self.get_object()
        AnalyticsService().analyze_match(match)
        serializer = self.get_serializer(match)
        return Response(serializer.data)

class IngestMatchView(APIView):
    def post(self, request):
        match_id = request.data.get('match_id')
        if not match_id:
            return Response({'error': 'match_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            match = GridService().ingest_match(match_id)
            AnalyticsService().analyze_match(match)
            return Response({'status': 'success', 'match_id': match.id, 'grid_match_id': match.grid_match_id})
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class TeamViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
