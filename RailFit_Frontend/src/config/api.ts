// API Configuration
// Centralized API base URL configuration to avoid hardcoded URLs throughout the app

// Default to localhost for development, use VITE_API_BASE_URL for production
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'

// API endpoints
export const API_ENDPOINTS = {
  // Auth endpoints  
  AUTH: {
    LOGIN: `${API_BASE_URL}/api/auth/login`,
    REGISTER: `${API_BASE_URL}/api/auth/register`,
  },
  
  // Asset endpoints
  ASSETS: {
    BASE: `${API_BASE_URL}/api/assets`,
    METRICS: `${API_BASE_URL}/api/assets/metrics`,
    BULK_IMPORT: `${API_BASE_URL}/api/assets/bulk-import`,
    QR_CODE: (assetId: string) => `${API_BASE_URL}/api/assets/${assetId}/qr`,
  },
  
  // Vendor endpoints
  VENDORS: {
    BASE: `${API_BASE_URL}/api/vendors`,
    BY_ID: (vendorId: string) => `${API_BASE_URL}/api/vendors/${vendorId}`,
  },
  
  // Inspection endpoints
  INSPECTIONS: {
    BASE: `${API_BASE_URL}/api/inspections`,
    ANALYTICS: `${API_BASE_URL}/api/inspections/analytics/summary`,
  },
  
  // Alert endpoints
  ALERTS: {
    BASE: `${API_BASE_URL}/api/alerts`,
  }
}

// Helper function to create fetch with default headers
export const createAuthenticatedFetch = (token?: string) => {
  return async (url: string, options: RequestInit = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    }

    return fetch(url, {
      ...options,
      headers,
    })
  }
}

// Helper to get auth token from localStorage
export const getAuthToken = (): string | null => {
  return localStorage.getItem('jwt_token')
}

// Helper for authenticated API calls
export const apiCall = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken()
  const authenticatedFetch = createAuthenticatedFetch(token || undefined)
  return authenticatedFetch(url, options)
}