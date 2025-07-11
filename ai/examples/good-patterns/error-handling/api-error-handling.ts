/**
 * API Error Handling - Good Patterns
 * 
 * This file demonstrates best practices for handling API errors
 * in a consistent, user-friendly way.
 */

// 1. Custom Error Classes for Different Error Types
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: string,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'ApiError';
    
    // Maintain proper stack trace in V8
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      status: this.status,
      code: this.code,
      context: this.context,
      stack: this.stack
    };
  }
}

export class ValidationError extends ApiError {
  constructor(
    message: string,
    public errors: Record<string, string[]>,
    context?: Record<string, any>
  ) {
    super(message, 422, 'VALIDATION_ERROR', context);
    this.name = 'ValidationError';
  }
}

export class NetworkError extends ApiError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, 0, 'NETWORK_ERROR', context);
    this.name = 'NetworkError';
  }
}

// 2. Centralized Error Response Handler
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
  code?: string;
}

export async function handleApiResponse<T>(response: Response): Promise<T> {
  let responseData: ApiResponse<T>;
  
  try {
    responseData = await response.json();
  } catch (parseError) {
    throw new ApiError(
      'Invalid response format',
      response.status,
      'PARSE_ERROR',
      { originalError: parseError }
    );
  }

  if (!response.ok) {
    const errorMessage = responseData.error || `HTTP ${response.status}`;
    
    // Handle specific error types
    switch (response.status) {
      case 422:
        throw new ValidationError(
          errorMessage,
          responseData.errors || {},
          { url: response.url }
        );
      
      case 401:
        throw new ApiError(
          'Authentication required',
          401,
          'UNAUTHORIZED',
          { url: response.url }
        );
      
      case 403:
        throw new ApiError(
          'Access denied',
          403,
          'FORBIDDEN',
          { url: response.url }
        );
      
      case 404:
        throw new ApiError(
          'Resource not found',
          404,
          'NOT_FOUND',
          { url: response.url }
        );
      
      case 429:
        throw new ApiError(
          'Rate limit exceeded',
          429,
          'RATE_LIMITED',
          { url: response.url, retryAfter: response.headers.get('Retry-After') }
        );
      
      default:
        throw new ApiError(
          errorMessage,
          response.status,
          responseData.code || 'API_ERROR',
          { url: response.url }
        );
    }
  }

  return responseData.data as T;
}

// 3. Resilient API Client with Retry Logic
interface ApiClientOptions {
  baseURL: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  onError?: (error: ApiError) => void;
}

export class ApiClient {
  private baseURL: string;
  private timeout: number;
  private retries: number;
  private retryDelay: number;
  private onError?: (error: ApiError) => void;

  constructor(options: ApiClientOptions) {
    this.baseURL = options.baseURL;
    this.timeout = options.timeout || 10000;
    this.retries = options.retries || 3;
    this.retryDelay = options.retryDelay || 1000;
    this.onError = options.onError;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const abortController = new AbortController();
    
    // Set timeout
    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, this.timeout);

    const requestOptions: RequestInit = {
      ...options,
      signal: abortController.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    let lastError: ApiError;
    
    for (let attempt = 0; attempt <= this.retries; attempt++) {
      try {
        const response = await fetch(url, requestOptions);
        clearTimeout(timeoutId);
        
        return await handleApiResponse<T>(response);
        
      } catch (error) {
        clearTimeout(timeoutId);
        
        if (error instanceof ApiError) {
          lastError = error;
          
          // Don't retry for certain error types
          if (error.status === 401 || error.status === 403 || error.status === 422) {
            this.onError?.(error);
            throw error;
          }
          
          // Don't retry on last attempt
          if (attempt === this.retries) {
            this.onError?.(error);
            throw error;
          }
          
          // Wait before retry
          await this.delay(this.retryDelay * Math.pow(2, attempt));
          continue;
        }
        
        // Handle fetch errors (network issues, timeouts)
        if (error.name === 'AbortError') {
          lastError = new NetworkError('Request timeout', { url, attempt });
        } else {
          lastError = new NetworkError(
            error.message || 'Network request failed',
            { url, attempt, originalError: error }
          );
        }
        
        // Don't retry on last attempt
        if (attempt === this.retries) {
          this.onError?.(lastError);
          throw lastError;
        }
        
        await this.delay(this.retryDelay * Math.pow(2, attempt));
      }
    }
    
    throw lastError!;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Convenience methods
  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = params 
      ? `${endpoint}?${new URLSearchParams(params)}`
      : endpoint;
    
    return this.request<T>(url, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// 4. React Hook for Error Handling
import { useState, useCallback } from 'react';

interface UseErrorHandlerReturn {
  error: ApiError | null;
  clearError: () => void;
  handleError: (error: unknown) => void;
}

export function useErrorHandler(): UseErrorHandlerReturn {
  const [error, setError] = useState<ApiError | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleError = useCallback((error: unknown) => {
    if (error instanceof ApiError) {
      setError(error);
    } else if (error instanceof Error) {
      setError(new ApiError(error.message, 500, 'UNKNOWN_ERROR'));
    } else {
      setError(new ApiError('An unknown error occurred', 500, 'UNKNOWN_ERROR'));
    }
  }, []);

  return { error, clearError, handleError };
}

// 5. Error Boundary Component
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, errorInfo: ErrorInfo) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    this.props.onError?.(error, errorInfo);
    
    // Log to monitoring service
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error!, this.state.errorInfo!);
      }

      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            <summary>Error details</summary>
            {this.state.error?.toString()}
            <br />
            {this.state.errorInfo?.componentStack}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

// 6. Usage Examples

// Example: Using the API client
export async function fetchUsers(): Promise<User[]> {
  const apiClient = new ApiClient({
    baseURL: '/api',
    onError: (error) => {
      // Log to monitoring service
      console.error('API Error:', error.toJSON());
    }
  });

  try {
    return await apiClient.get<User[]>('/users');
  } catch (error) {
    // Handle specific error types
    if (error instanceof ValidationError) {
      console.error('Validation errors:', error.errors);
    } else if (error instanceof NetworkError) {
      console.error('Network error:', error.message);
    }
    throw error;
  }
}

// Example: Component with error handling
export function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const { error, clearError, handleError } = useErrorHandler();

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      clearError();
      const userData = await fetchUsers();
      setUsers(userData);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }, [clearError, handleError]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  if (loading) return <div>Loading...</div>;
  
  if (error) {
    return (
      <div className="error-message">
        <p>Error: {error.message}</p>
        {error instanceof ValidationError && (
          <ul>
            {Object.entries(error.errors).map(([field, messages]) => (
              <li key={field}>
                {field}: {messages.join(', ')}
              </li>
            ))}
          </ul>
        )}
        <button onClick={loadUsers}>Retry</button>
        <button onClick={clearError}>Dismiss</button>
      </div>
    );
  }

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}