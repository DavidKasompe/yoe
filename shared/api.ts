/**
 * Shared types between client and server
 */

// User types
export type UserRole = "Coach" | "Analyst" | "Player" | "Admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  team?: string;
  region?: string;
  fullName?: string;
  displayName?: string;
  teamAffiliation?: string;
}

// Auth API types
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface RegisterResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
  expires_in: number;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
  expires_in: number;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface LogoutAllResponse {
  success: boolean;
}

export interface OAuthRequest {
  provider: "google" | "discord";
  code: string;
  redirectUri: string;
}

export interface OAuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  isNewUser: boolean;
}

// User API types
export interface UpdateUserRequest {
  name?: string;
  team?: string;
  region?: string;
  fullName?: string;
  displayName?: string;
  teamAffiliation?: string;
}

export interface UpdateUserResponse {
  success: boolean;
}

// Preferences types
export interface UserPreferences {
  default_game: "LoL" | "VAL" | "CS2" | "OW";
  ai_verbosity: "concise" | "detailed";
  dashboard_view: "coach" | "scout" | "draft";
  refresh_frequency?: string;
  notifications?: {
    email_insights: boolean;
    match_alerts: boolean;
    weekly_digest: boolean;
  };
}

export interface UpdatePreferencesRequest {
  default_game?: string;
  ai_verbosity?: string;
  dashboard_view?: string;
  refresh_frequency?: string;
  notifications?: {
    email_insights?: boolean;
    match_alerts?: boolean;
    weekly_digest?: boolean;
  };
}

// Security Audit types
export type AuditEventType =
  | "LOGIN"
  | "LOGOUT"
  | "LOGOUT_ALL"
  | "REGISTER"
  | "PASSWORD_CHANGE"
  | "OAUTH_LOGIN"
  | "TOKEN_REFRESH"
  | "ACCESS_DENIED"
  | "ACCOUNT_LOCKED";

export interface AuditEvent {
  id: string;
  userId?: string;
  eventType: AuditEventType;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, unknown>;
  timestamp: Date;
  success: boolean;
}

// RBAC permissions
export const ROLE_PERMISSIONS = {
  Admin: [
    "view_assistant_coach",
    "view_scouting_reports",
    "draft_intelligence",
    "export_reports",
    "settings_access",
    "player_personal_stats",
    "admin_panel",
    "manage_users",
    "view_audit_logs",
  ],
  Coach: [
    "view_assistant_coach",
    "view_scouting_reports",
    "draft_intelligence",
    "export_reports",
    "settings_access",
  ],
  Analyst: [
    "view_assistant_coach",
    "view_scouting_reports",
    "draft_intelligence",
    "export_reports",
    "settings_access",
  ],
  Player: ["player_personal_stats", "settings_access"],
} as const;

export function hasPermission(role: UserRole, permission: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission as never) ?? false;
}

export function isAdmin(role: UserRole): boolean {
  return role === "Admin";
}
