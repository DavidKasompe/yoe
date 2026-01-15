from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Match, Team, Player, PlayerStats, TeamStats, Draft, ChampionPool, AIInsight, UserProfile, AuditLog

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ('role',)

class UserSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source='profile.role', read_only=True)
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'role')

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ('username', 'password', 'email', 'first_name', 'last_name', 'role')

    def create(self, validated_data):
        role = validated_data.pop('role', 'Coach')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', '')
        )
        UserProfile.objects.create(user=user, role=role)
        return user

class AuditLogSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = AuditLog
        fields = '__all__'

class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = '__all__'

class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = '__all__'

class PlayerStatsSerializer(serializers.ModelSerializer):
    player = PlayerSerializer()
    
    class Meta:
        model = PlayerStats
        fields = '__all__'

class TeamStatsSerializer(serializers.ModelSerializer):
    team = TeamSerializer()
    
    class Meta:
        model = TeamStats
        fields = '__all__'

class DraftSerializer(serializers.ModelSerializer):
    team = TeamSerializer()
    
    class Meta:
        model = Draft
        fields = '__all__'

class AIInsightSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIInsight
        fields = '__all__'

class MatchSerializer(serializers.ModelSerializer):
    winner = TeamSerializer()
    player_stats = PlayerStatsSerializer(many=True, read_only=True)
    team_stats = TeamStatsSerializer(many=True, read_only=True)
    drafts = DraftSerializer(many=True, read_only=True)
    insights = AIInsightSerializer(many=True, read_only=True)
    
    class Meta:
        model = Match
        fields = '__all__'
