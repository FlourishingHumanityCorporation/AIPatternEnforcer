/**
 * Authentication - Good Patterns
 *
 * This file demonstrates best practices for implementing authentication
 * with proper security, token management, and user experience.
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback } from
"react";
import { Navigate, useLocation } from "react-router-dom";

// Types
interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user" | "guest";
  avatar?: string;
  emailVerified: boolean;
  createdAt: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// 1. Secure Token Storage
export class TokenStorage {
  private static readonly ACCESS_TOKEN_KEY = "accessToken";
  private static readonly REFRESH_TOKEN_KEY = "refreshToken";
  private static readonly EXPIRES_AT_KEY = "expiresAt";

  static setTokens(tokens: AuthTokens): void {
    // Store access token in memory (most secure for short-lived tokens)
    sessionStorage.setItem(this.ACCESS_TOKEN_KEY, tokens.accessToken);

    // Store refresh token in httpOnly cookie (handled by server)
    // For client-side demo, we'll use localStorage with encryption
    localStorage.setItem(
      this.REFRESH_TOKEN_KEY,
      this.encrypt(tokens.refreshToken)
    );
    localStorage.setItem(this.EXPIRES_AT_KEY, tokens.expiresAt.toString());
  }

  static getAccessToken(): string | null {
    return sessionStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  static getRefreshToken(): string | null {
    const encrypted = localStorage.getItem(this.REFRESH_TOKEN_KEY);
    return encrypted ? this.decrypt(encrypted) : null;
  }

  static getExpiresAt(): number | null {
    const expiresAt = localStorage.getItem(this.EXPIRES_AT_KEY);
    return expiresAt ? parseInt(expiresAt, 10) : null;
  }

  static clearTokens(): void {
    sessionStorage.removeItem(this.ACCESS_TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.EXPIRES_AT_KEY);
  }

  static isTokenExpired(): boolean {
    const expiresAt = this.getExpiresAt();
    if (!expiresAt) return true;

    // Consider token expired 5 minutes before actual expiry
    return Date.now() > expiresAt - 5 * 60 * 1000;
  }

  // Simple encryption for demo - use proper encryption in production
  private static encrypt(text: string): string {
    return btoa(text);
  }

  private static decrypt(encrypted: string): string {
    return atob(encrypted);
  }
}

// 2. HTTP Client with Token Management
export class AuthenticatedHttpClient {
  private baseURL: string;
  private isRefreshing = false;
  private refreshPromise: Promise<string> | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    // Get or refresh token
    const token = await this.getValidToken();

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
      }
    });

    if (response.status === 401) {
      // Token might be expired, try to refresh
      const refreshedToken = await this.refreshToken();

      if (refreshedToken) {
        // Retry request with new token
        return this.request(endpoint, options);
      } else {
        // Refresh failed, redirect to login
        this.handleAuthFailure();
        throw new Error("Authentication failed");
      }
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  private async getValidToken(): Promise<string | null> {
    const accessToken = TokenStorage.getAccessToken();

    if (accessToken && !TokenStorage.isTokenExpired()) {
      return accessToken;
    }

    // Token is expired or missing, try to refresh
    return this.refreshToken();
  }

  private async refreshToken(): Promise<string | null> {
    // Prevent multiple simultaneous refresh attempts
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    const refreshToken = TokenStorage.getRefreshToken();
    if (!refreshToken) {
      return null;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.performTokenRefresh(refreshToken);

    try {
      const newAccessToken = await this.refreshPromise;
      return newAccessToken;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(
  refreshToken: string)
  : Promise<string | null> {
    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ refreshToken })
      });

      if (!response.ok) {
        throw new Error("Token refresh failed");
      }

      const {
        accessToken,
        refreshToken: newRefreshToken,
        expiresAt
      } = await response.json();

      TokenStorage.setTokens({
        accessToken,
        refreshToken: newRefreshToken,
        expiresAt
      });

      return accessToken;
    } catch (error) {
      logger.error("Token refresh failed:", error);
      TokenStorage.clearTokens();
      return null;
    }
  }

  private handleAuthFailure(): void {
    TokenStorage.clearTokens();
    window.location.href = "/login";
  }
}

// 3. Authentication Context
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// 4. Authentication Provider
interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const httpClient = new AuthenticatedHttpClient("/api");

  const isAuthenticated = !!user;

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = TokenStorage.getAccessToken();

      if (token && !TokenStorage.isTokenExpired()) {
        try {
          await refreshUser();
        } catch (error) {
          logger.error("Failed to initialize auth:", error);
          TokenStorage.clearTokens();
        }
      }

      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed");
      }

      const { user, accessToken, refreshToken, expiresAt } =
      await response.json();

      TokenStorage.setTokens({ accessToken, refreshToken, expiresAt });
      setUser(user);

      // Track login event
      trackEvent("user_login", { userId: user.id });
    } catch (error) {
      setError(error instanceof Error ? error.message : "Login failed");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    setIsLoading(true);
    setError(null);

    try {
      if (data.password !== data.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Registration failed");
      }

      const { user, accessToken, refreshToken, expiresAt } =
      await response.json();

      TokenStorage.setTokens({ accessToken, refreshToken, expiresAt });
      setUser(user);

      // Track registration event
      trackEvent("user_register", { userId: user.id });
    } catch (error) {
      setError(error instanceof Error ? error.message : "Registration failed");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(() => {
    // Call logout endpoint to invalidate tokens on server
    fetch("/api/auth/logout", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${TokenStorage.getAccessToken()}`
      }
    }).catch(() => {

      // Ignore errors on logout
    });
    TokenStorage.clearTokens();
    setUser(null);
    setError(null);

    // Track logout event
    if (user) {
      trackEvent("user_logout", { userId: user.id });
    }
  }, [user]);

  const refreshUser = async () => {
    try {
      const userData = await httpClient.request<User>("/auth/me");
      setUser(userData);
    } catch (error) {
      logger.error("Failed to refresh user:", error);
      logout();
      throw error;
    }
  };

  const clearError = () => setError(null);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    error,
    login,
    register,
    logout,
    refreshUser,
    clearError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 5. Route Protection Components
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: User["role"];
  fallback?: React.ReactNode;
}

export function ProtectedRoute({
  children,
  requiredRole,
  fallback
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole && user.role !== "admin") {
    return fallback || <div>Access denied</div>;
  }

  return <>{children}</>;
}

export function PublicRoute({ children }: {children: React.ReactNode;}) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (user) {
    const from = (location.state as any)?.from?.pathname || "/dashboard";
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
}

// 6. Authentication Forms
export function LoginForm() {
  const { login, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState<LoginCredentials>({
    email: "",
    password: "",
    rememberMe: false
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await login(formData);
    } catch (error) {

      // Error is handled by context
    }};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <h2>Sign In</h2>

      {error &&
      <div className="error-message">
          {error}
          <button type="button" onClick={clearError}>
            ×
          </button>
        </div>
      }

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          autoComplete="email" />

      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
          autoComplete="current-password" />

      </div>

      <div className="form-group checkbox-group">
        <label>
          <input
            name="rememberMe"
            type="checkbox"
            checked={formData.rememberMe}
            onChange={handleChange} />

          Remember me
        </label>
      </div>

      <button type="submit" disabled={isLoading} className="submit-button">
        {isLoading ? "Signing in..." : "Sign In"}
      </button>

      <div className="form-links">
        <a href="/forgot-password">Forgot your password?</a>
        <a href="/register">Don't have an account? Sign up</a>
      </div>
    </form>);

}

export function RegisterForm() {
  const { register, isLoading, error, clearError } = useAuth();
  const [formData, setFormData] = useState<RegisterData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>>(
    {});

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (formData.name.length < 2) {
      errors.name = "Name must be at least 2 characters";
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email";
    }

    if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password =
      "Password must contain uppercase, lowercase, and number";
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) {
      return;
    }

    try {
      await register(formData);
    } catch (error) {

      // Error is handled by context
    }};

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <h2>Create Account</h2>

      {error &&
      <div className="error-message">
          {error}
          <button type="button" onClick={clearError}>
            ×
          </button>
        </div>
      }

      <div className="form-group">
        <label htmlFor="name">Full Name</label>
        <input
          id="name"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          required
          autoComplete="name" />

        {validationErrors.name &&
        <div className="field-error">{validationErrors.name}</div>
        }
      </div>

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          autoComplete="email" />

        {validationErrors.email &&
        <div className="field-error">{validationErrors.email}</div>
        }
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
          autoComplete="new-password" />

        {validationErrors.password &&
        <div className="field-error">{validationErrors.password}</div>
        }
      </div>

      <div className="form-group">
        <label htmlFor="confirmPassword">Confirm Password</label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          autoComplete="new-password" />

        {validationErrors.confirmPassword &&
        <div className="field-error">{validationErrors.confirmPassword}</div>
        }
      </div>

      <button type="submit" disabled={isLoading} className="submit-button">
        {isLoading ? "Creating account..." : "Create Account"}
      </button>

      <div className="form-links">
        <a href="/login">Already have an account? Sign in</a>
      </div>
    </form>);

}

// 7. User Profile Component
export function UserProfile() {
  const { user, refreshUser, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || "",
    email: user?.email || ""
  });

  if (!user) return null;

  const handleSave = async () => {
    try {
      // Update user profile
      await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${TokenStorage.getAccessToken()}`
        },
        body: JSON.stringify(editData)
      });

      await refreshUser();
      setIsEditing(false);
    } catch (error) {
      logger.error("Failed to update profile:", error);
    }
  };

  return (
    <div className="user-profile">
      <div className="profile-header">
        <img
          src={user.avatar || "/default-avatar.png"}
          alt={user.name}
          className="avatar" />

        <div className="user-info">
          {isEditing ?
          <input
            value={editData.name}
            onChange={(e) =>
            setEditData((prev) => ({ ...prev, name: e.target.value }))
            } /> :


          <h2>{user.name}</h2>
          }

          {isEditing ?
          <input
            value={editData.email}
            onChange={(e) =>
            setEditData((prev) => ({ ...prev, email: e.target.value }))
            } /> :


          <p>{user.email}</p>
          }

          <span className={`role-badge ${user.role}`}>{user.role}</span>
        </div>
      </div>

      <div className="profile-actions">
        {isEditing ?
        <>
            <button onClick={handleSave}>Save</button>
            <button onClick={() => setIsEditing(false)}>Cancel</button>
          </> :

        <button onClick={() => setIsEditing(true)}>Edit Profile</button>
        }

        <button onClick={logout} className="logout-button">
          Sign Out
        </button>
      </div>

      {!user.emailVerified &&
      <div className="verification-notice">
          Please verify your email address to access all features.
          <button>Resend verification email</button>
        </div>
      }
    </div>);

}

// 8. Utility Functions
function trackEvent(event: string, data: Record<string, any>) {
  // Analytics tracking
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", event, data);
  }
}

// Password strength validator
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) score += 1;else
  feedback.push("Use at least 8 characters");

  if (/[a-z]/.test(password)) score += 1;else
  feedback.push("Include lowercase letters");

  if (/[A-Z]/.test(password)) score += 1;else
  feedback.push("Include uppercase letters");

  if (/\d/.test(password)) score += 1;else
  feedback.push("Include numbers");

  if (/[^a-zA-Z\d]/.test(password)) score += 1;else
  feedback.push("Include special characters");

  return {
    isValid: score >= 4,
    score,
    feedback
  };
}

// Email validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}