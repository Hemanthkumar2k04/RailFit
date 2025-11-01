// HTTP interceptor to handle JWT expiration and 401 responses
import { isTokenValid, clearAuthData } from './jwt';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

/**
 * Enhanced fetch wrapper that handles JWT expiration
 */
export async function apiRequest<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('jwt_token');
  
  // Check token validity before making request
  if (!isTokenValid(token)) {
    handleTokenExpiration();
    return {
      status: 401,
      error: 'Token expired'
    };
  }

  // Prepare headers
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  // Add authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle 401 Unauthorized - token expired or invalid
    if (response.status === 401) {
      handleTokenExpiration();
      return {
        status: 401,
        error: 'Unauthorized - please login again'
      };
    }

    // Handle other error status codes
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage;
      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.detail || errorJson.message || `HTTP ${response.status}`;
      } catch {
        errorMessage = errorText || `HTTP ${response.status}`;
      }
      
      return {
        status: response.status,
        error: errorMessage
      };
    }

    // Parse successful response
    const data = await response.json();
    return {
      status: response.status,
      data
    };

  } catch (error) {
    return {
      status: 0,
      error: error instanceof Error ? error.message : 'Network error'
    };
  }
}

/**
 * Handle token expiration by clearing data and redirecting to login
 */
export function handleTokenExpiration(): void {
  // Clear all authentication data
  clearAuthData();
  
  // Dispatch custom event that AuthContext can listen to
  window.dispatchEvent(new CustomEvent('jwt_expired'));
  
  // Optional: Show a toast notification if you have a toast system
  // toast.warning('Your session has expired. Please login again.');
}

/**
 * Setup automatic token expiration checking
 */
export function setupTokenExpirationCheck(): void {
  const checkInterval = 60000; // Check every minute
  
  setInterval(() => {
    const token = localStorage.getItem('jwt_token');
    if (token && !isTokenValid(token)) {
      handleTokenExpiration();
    }
  }, checkInterval);
}