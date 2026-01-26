"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";

// Simplified User type for now
interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  displayName: string;
  role: string;
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
  register: (
    fullName: string,
    email: string,
    password: string,
    role: string
  ) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (user: Partial<AuthUser>) => void;
  refreshSession: () => Promise<boolean>;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const REFRESH_THRESHOLD = 5 * 60 * 1000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const storeTokens = (accessToken: string, refreshToken: string, expiresIn: number = 86400) => {
    const expiresAt = Date.now() + expiresIn * 1000;
    const newTokens: AuthTokens = { accessToken, refreshToken, expiresAt };
    setTokens(newTokens);
    localStorage.setItem("authTokens", JSON.stringify(newTokens));
    // Also store a simple version for easier access in other components if needed
    localStorage.setItem("accessToken", accessToken);
  };

  const clearTokens = () => {
    setTokens(null);
    localStorage.removeItem("authTokens");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
  };

  const getAuthHeader = useCallback(() => {
    const storedTokens = JSON.parse(localStorage.getItem("authTokens") || "null");
    const accessToken = tokens?.accessToken || storedTokens?.accessToken;
    if (!accessToken) return {};
    return { Authorization: `Bearer ${accessToken}` };
  }, [tokens]);

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
      storeTokens(data.access, data.refresh, 86400);
      return true;
    } catch (error) {
      console.error("Token refresh failed:", error);
      return false;
    }
  }, [tokens]);

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

  useEffect(() => {
    const checkAuth = async () => {
      const storedTokens = JSON.parse(localStorage.getItem("authTokens") || "null");
      const storedUser = JSON.parse(localStorage.getItem("user") || "null");

      if (storedTokens && storedUser) {
        setTokens(storedTokens);
        setUser(storedUser);

        if (storedTokens.expiresAt - Date.now() < REFRESH_THRESHOLD) {
          const refreshed = await refreshSession();
          if (!refreshed) {
            setIsLoading(false);
            return;
          }
        }
        
        // Re-get tokens after potential refresh
        const currentTokens = JSON.parse(localStorage.getItem("authTokens") || "null");
        if (currentTokens?.accessToken) {
          try {
            const response = await fetch("/api/auth/me", {
              headers: { Authorization: `Bearer ${currentTokens.accessToken}` },
            });
            if (response.ok) {
              const userData = await response.json();
              const userObj = {
                id: userData.id,
                email: userData.email,
                fullName: `${userData.first_name || ''} ${userData.last_name || ''}`.trim(),
                displayName: userData.username,
                role: userData.role
              };
              
              // Only update if it's actually different to avoid unnecessary re-renders
              if (JSON.stringify(userObj) !== JSON.stringify(storedUser)) {
                setUser(userObj);
                localStorage.setItem("user", JSON.stringify(userObj));
              }
            } else if (response.status === 401) {
              // Only try refreshing once to avoid infinite loops if refresh also returns 401
              const refreshed = await refreshSession();
              if (refreshed) {
                // One more try with new token
                const newTokens = JSON.parse(localStorage.getItem("authTokens") || "null");
                if (newTokens?.accessToken) {
                   const retryResponse = await fetch("/api/auth/me", {
                     headers: { Authorization: `Bearer ${newTokens.accessToken}` },
                   });
                   if (retryResponse.ok) {
                     const userData = await retryResponse.json();
                     const userObj = {
                       id: userData.id,
                       email: userData.email,
                       fullName: `${userData.first_name || ''} ${userData.last_name || ''}`.trim(),
                       displayName: userData.username,
                       role: userData.role
                     };
                     setUser(userObj);
                     localStorage.setItem("user", JSON.stringify(userObj));
                   }
                }
              }
            }
          } catch (e) {
             // Use cached user if network fails
          }
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []); // Remove refreshSession from dependencies

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Login failed");
      }

      const data = await response.json();
      storeTokens(data.access, data.refresh);
      
      const userObj = {
        id: data.user.id,
        email: data.user.email,
        fullName: `${data.user.first_name || ''} ${data.user.last_name || ''}`.trim(),
        displayName: data.user.username,
        role: data.user.role
      };
      
      localStorage.setItem("user", JSON.stringify(userObj));
      setUser(userObj);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (fullName: string, email: string, password: string, role: string) => {
    setIsLoading(true);
    try {
      const names = fullName.trim().split(' ');
      const firstName = names[0];
      const lastName = names.slice(1).join(' ') || '.';
      
      const response = await fetch("/api/auth/register", {
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
        throw new Error(error.error || "Registration failed");
      }

      const data = await response.json();
      storeTokens(data.access, data.refresh);
      
      const userObj = {
        id: data.user.id,
        email: data.user.email,
        fullName: `${data.user.first_name || ''} ${data.user.last_name || ''}`.trim(),
        displayName: data.user.username,
        role: data.user.role
      };
      
      localStorage.setItem("user", JSON.stringify(userObj));
      setUser(userObj);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: getAuthHeader(),
      });
    } finally {
      clearTokens();
      setUser(null);
    }
  };

  const updateUser = (updatedData: Partial<AuthUser>) => {
    if (user) {
      const newUser = { ...user, ...updatedData };
      setUser(newUser);
      localStorage.setItem("user", JSON.stringify(newUser));
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.role === 'Admin') return true;
    if (user.role === 'Coach') return ['analyze', 'view'].includes(permission);
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'Admin',
        login,
        register,
        logout,
        updateUser,
        refreshSession,
        hasPermission,
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
