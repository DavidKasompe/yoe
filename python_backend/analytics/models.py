from django.db import models
from django.utils import timezone
from django.contrib.auth.models import User

class UserProfile(models.Model):
    ROLES = (
        ('Admin', 'Admin'),
        ('Coach', 'Coach'),
        ('Analyst', 'Analyst'),
        ('Player', 'Player'),
    )
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLES, default='Coach')
    
    def __str__(self):
        return f"{self.user.username} - {self.role}"

class AuditLog(models.Model):
    EVENT_TYPES = (
        ('LOGIN', 'Login'),
        ('LOGOUT', 'Logout'),
        ('LOGOUT_ALL', 'Logout All'),
        ('REGISTER', 'Register'),
        ('PASSWORD_CHANGE', 'Password Change'),
        ('OAUTH_LOGIN', 'OAuth Login'),
        ('TOKEN_REFRESH', 'Token Refresh'),
        ('ACCESS_DENIED', 'Access Denied'),
        ('ACCOUNT_LOCKED', 'Account Locked'),
    )
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    event_type = models.CharField(max_length=50, choices=EVENT_TYPES)
    description = models.TextField()
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.timestamp} - {self.user} - {self.event_type}"

class Team(models.Model):
    name = models.CharField(max_length=100)
    region = models.CharField(max_length=50)
    league = models.CharField(max_length=50)
    
    def __str__(self):
        return self.name

class Player(models.Model):
    team = models.ForeignKey(Team, on_delete=models.CASCADE, related_name='players')
    role = models.CharField(max_length=20)  # Top, Jungle, Mid, Bot, Support
    identifier = models.CharField(max_length=100)  # IGN
    
    def __str__(self):
        return f"{self.identifier} ({self.role})"

class Match(models.Model):
    grid_match_id = models.CharField(max_length=100, unique=True)
    date = models.DateTimeField(default=timezone.now)
    patch = models.CharField(max_length=20)
    duration = models.IntegerField()  # Seconds
    winner = models.ForeignKey(Team, on_delete=models.SET_NULL, null=True, related_name='wins')
    
    def __str__(self):
        return f"Match {self.grid_match_id}"

class PlayerStats(models.Model):
    match = models.ForeignKey(Match, on_delete=models.CASCADE, related_name='player_stats')
    player = models.ForeignKey(Player, on_delete=models.CASCADE)
    kills = models.IntegerField(default=0)
    deaths = models.IntegerField(default=0)
    assists = models.IntegerField(default=0)
    cs = models.IntegerField(default=0)
    vision_score = models.IntegerField(default=0)
    gold_earned = models.IntegerField(default=0)
    positioning_score = models.FloatField(default=0.0)  # AI derived metric
    
    class Meta:
        unique_together = ('match', 'player')

class TeamStats(models.Model):
    match = models.ForeignKey(Match, on_delete=models.CASCADE, related_name='team_stats')
    team = models.ForeignKey(Team, on_delete=models.CASCADE)
    barons = models.IntegerField(default=0)
    dragons = models.IntegerField(default=0)
    towers = models.IntegerField(default=0)
    gold_diff_15 = models.IntegerField(default=0)
    
    class Meta:
        unique_together = ('match', 'team')

class Draft(models.Model):
    match = models.ForeignKey(Match, on_delete=models.CASCADE, related_name='drafts')
    team = models.ForeignKey(Team, on_delete=models.CASCADE)
    bans = models.JSONField(default=list) 
    picks = models.JSONField(default=list)
    win_probability = models.FloatField(null=True, blank=True)
    
class ChampionPool(models.Model):
    player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='champion_pool')
    champion = models.CharField(max_length=100)
    frequency = models.IntegerField(default=0)
    win_rate = models.FloatField(default=0.0)
    
    class Meta:
        unique_together = ('player', 'champion')

class AIInsight(models.Model):
    match = models.ForeignKey(Match, on_delete=models.CASCADE, related_name='insights', null=True, blank=True)
    category = models.CharField(max_length=50) # 'Draft', 'Performance', 'Macrogaming'
    explanation = models.TextField()
    confidence = models.FloatField(default=0.0)
    timestamp = models.DateTimeField(auto_now_add=True)

class ExtractedFeature(models.Model):
    entity_id = models.CharField(max_length=100) # Generic ID ref
    entity_type = models.CharField(max_length=50) # 'Player', 'Team', 'Match'
    feature_name = models.CharField(max_length=100)
    value = models.FloatField()
