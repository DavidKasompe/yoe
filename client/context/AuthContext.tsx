import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { User, UserRole, hasPermission, isAdmin } from "@shared/api";

interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  displayName: string;
  role: UserRole;
  teamAffiliation?: string;
  region?: string;
  team?: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithOAuth: (provider: "google" | "discord", code: string, redirectUri: string) => Promise<void>;
  register: (
    fullName: string,
    email: string,
    password: string,
    role: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  updateUser: (user: Partial<AuthUser>) => void;
  hasPermission: (permission: string) => boolean;
  refreshSession: () => Promise<boolean>;
  getOAuthUrl: (provider: "google" | "discord") => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Token refresh threshold (5 minutes before expiry)
const REFRESH_THRESHOLD = 5 * 60 * 1000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Store tokens securely
  const storeTokens = (accessToken: string, refreshToken: string, expiresIn: number) => {
    const expiresAt = Date.now() + expiresIn * 1000;
    const newTokens: AuthTokens = { accessToken, refreshToken, expiresAt };
    setTokens(newTokens);
    localStorage.setItem("authTokens", JSON.stringify(newTokens));
  };

  // Clear tokens
  const clearTokens = () => {
    setTokens(null);
    localStorage.removeItem("authTokens");
    localStorage.removeItem("user");
  };

  // Get auth header
  const getAuthHeader = useCallback(() => {
    if (!tokens?.accessToken) return {};
    return { Authorization: `Bearer ${tokens.accessToken}` };
  }, [tokens]);

  // Refresh access token
  const refreshSession = useCallback(async (): Promise<boolean> => {
    const storedTokens = tokens || JSON.parse(localStorage.getItem("authTokens") || "null");
    
    if (!storedTokens?.refreshToken) {
      return false;
    }

    try {
      const response = await fetch("/api/auth/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: storedTokens.refreshToken }),
      });

      if (!response.ok) {
        clearTokens();
        setUser(null);
        return false;
      }

      const data = await response.json();
      storeTokens(data.access, data.refresh, 3600);
      return true;
    } catch (error) {
      console.error("Token refresh failed:", error);
      return false;
    }
  }, [tokens]);

  // Auto-refresh tokens before expiry
  useEffect(() => {
    if (!tokens) return;

    const timeUntilExpiry = tokens.expiresAt - Date.now();
    const refreshTime = timeUntilExpiry - REFRESH_THRESHOLD;

    if (refreshTime <= 0) {
      refreshSession();
      return;
    }

    const timer = setTimeout(() => {
      refreshSession();
    }, refreshTime);

    return () => clearTimeout(timer);
  }, [tokens, refreshSession]);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedTokens = JSON.parse(localStorage.getItem("authTokens") || "null");
      const storedUser = JSON.parse(localStorage.getItem("user") || "null");

      if (storedTokens && storedUser) {
        setTokens(storedTokens);

        // Check if token is expired or about to expire
        if (storedTokens.expiresAt - Date.now() < REFRESH_THRESHOLD) {
          const refreshed = await refreshSession();
          if (!refreshed) {
            setIsLoading(false);
            return;
          }
        }

        // Verify token with backend
        try {
          const response = await fetch("/api/users/me/", {
            headers: { Authorization: `Bearer ${storedTokens.accessToken}` },
          });

          if (response.ok) {
            const userData = await response.json();
            const userObj = {
              id: userData.id,
              email: userData.email,
              fullName: `${userData.first_name} ${userData.last_name}`.trim(),
              displayName: userData.username,
              role: userData.role || storedUser.role || "Coach"
            };
            setUser(userObj);
            localStorage.setItem("user", JSON.stringify(userObj));
          } else {
            // Try refresh
            const refreshed = await refreshSession();
            if (refreshed) {
              const retryResponse = await fetch("/api/users/me/", {
                headers: { Authorization: `Bearer ${JSON.parse(localStorage.getItem("authTokens") || "{}").accessToken}` },
              });
              if (retryResponse.ok) {
                const userData = await retryResponse.json();
                const userObj = {
                  id: userData.id,
                  email: userData.email,
                  fullName: `${userData.first_name} ${userData.last_name}`.trim(),
                  displayName: userData.username,
                  role: userData.role || storedUser.role || "Coach"
                };
                setUser(userObj);
                localStorage.setItem("user", JSON.stringify(userObj));
              } else {
                clearTokens();
              }
            } else {
              clearTokens();
            }
          }
        } catch (error) {
          // Network error, use cached user
          setUser(storedUser);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Login failed");
      }

      const data = await response.json();
      storeTokens(data.access, data.refresh, 3600);
      
      const userObj = {
        id: data.user?.id || "",
        email: data.user?.email || email,
        fullName: data.user?.first_name ? `${data.user.first_name} ${data.user.last_name}` : "",
        displayName: data.user?.username || email.split('@')[0],
        role: data.user?.role || "Coach"
      };
      
      localStorage.setItem("user", JSON.stringify(userObj));
      setUser(userObj);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithOAuth = async (
    provider: "google" | "discord",
    code: string,
    redirectUri: string
  ) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/oauth/callback/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider, code, redirectUri }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "OAuth login failed");
      }

      const data = await response.json();
      storeTokens(data.access, data.refresh, 3600);
      
      const userObj = {
        id: data.user.id,
        email: data.user.email,
        fullName: `${data.user.first_name} ${data.user.last_name}`.trim(),
        displayName: data.user.username,
        role: data.user.role || "Coach"
      };

      localStorage.setItem("user", JSON.stringify(userObj));
      setUser(userObj);
    } finally {
      setIsLoading(false);
    }
  };

  const getOAuthUrl = async (provider: "google" | "discord"): Promise<string | null> => {
    try {
      const redirectUri = `${window.location.origin}/auth/oauth/callback`;
      const response = await fetch(
        `/api/auth/oauth/url/?provider=${provider}&redirectUri=${encodeURIComponent(redirectUri)}`
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      // Store state for verification
      sessionStorage.setItem("oauth_state", data.state);
      return data.url;
    } catch (error) {
      console.error("Failed to get OAuth URL:", error);
      return null;
    }
  };

  const register = async (
    fullName: string,
    email: string,
    password: string,
    role: string
  ) => {
    setIsLoading(true);
    try {
      const names = fullName.trim().split(' ');
      const firstName = names[0];
      const lastName = names.slice(1).join(' ') || '.';
      
      const response = await fetch("/api/auth/register/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          username: email, 
          email, 
          password, 
          first_name: firstName, 
          last_name: lastName,
          role: role
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(JSON.stringify(error) || "Registration failed");
      }

      const data = await response.json();
      storeTokens(data.access, data.refresh, 3600);
      
      const userObj = {
        id: data.user.id,
        email: data.user.email,
        fullName: `${data.user.first_name} ${data.user.last_name}`.trim(),
        displayName: data.user.username,
        role: data.user.role || (role as UserRole)
      };
      
      localStorage.setItem("user", JSON.stringify(userObj));
      setUser(userObj);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader()
        },
        body: JSON.stringify({ refresh: tokens?.refreshToken })
      });
    } finally {
      clearTokens();
      setUser(null);
    }
  };

  const logoutAll = async () => {
    try {
      await fetch("/api/auth/logout-all", {
        method: "POST",
        headers: getAuthHeader(),
      });
    } finally {
      clearTokens();
      setUser(null);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    const response = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader(),
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to change password");
    }
  };

  const updateUser = (updatedData: Partial<AuthUser>) => {
    if (user) {
      const newUser = { ...user, ...updatedData };
      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));
    }
  };

  const checkPermission = (permission: string): boolean => {
    if (!user) return false;
    return hasPermission(user.role, permission);
  };

  const checkIsAdmin = (): boolean => {
    if (!user) return false;
    return isAdmin(user.role);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: checkIsAdmin(),
        login,
        loginWithOAuth,
        register,
        logout,
        logoutAll,
        changePassword,
        updateUser,
        hasPermission: checkPermission,
        refreshSession,
        getOAuthUrl,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
