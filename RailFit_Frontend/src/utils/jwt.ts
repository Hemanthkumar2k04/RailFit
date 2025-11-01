// JWT utility functions for token validation and expiration handling

export interface JWTPayload {
  sub: string;
  exp: number;
  id: string;
  email: string;
  role: string;
}

/**
 * Decode JWT token without verification (client-side only for expiration check)
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

/**
 * Check if JWT token is expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    const payload = decodeJWT(token);
    if (!payload || !payload.exp) return true;
    
    // Convert exp from seconds to milliseconds and compare with current time
    const expirationTime = payload.exp * 1000;
    const currentTime = Date.now();
    
    // Add 30 second buffer to account for network delays
    return currentTime >= (expirationTime - 30000);
  } catch (error) {
    return true;
  }
}

/**
 * Get time until token expires (in milliseconds)
 */
export function getTimeUntilExpiration(token: string): number {
  try {
    const payload = decodeJWT(token);
    if (!payload || !payload.exp) return 0;
    
    const expirationTime = payload.exp * 1000;
    const currentTime = Date.now();
    
    return Math.max(0, expirationTime - currentTime);
  } catch (error) {
    return 0;
  }
}

/**
 * Check if token is valid and not expired
 */
export function isTokenValid(token: string | null): boolean {
  if (!token) return false;
  return !isTokenExpired(token);
}

/**
 * Clear all authentication data from localStorage
 */
export function clearAuthData(): void {
  localStorage.removeItem('jwt_token');
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('user');
}