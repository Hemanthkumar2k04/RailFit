import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration
// Note: For React Native, use your computer's IP address instead of localhost when testing on physical device
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:8000/api' // Development - use your actual IP like 'http://192.168.1.100:8000/api' for physical device
  : 'https://your-production-api.com/api'; // Production URL
const AUTH_TOKEN_KEY = 'auth_token';

// Types
export interface ApiAsset {
  asset_id: string;
  type: string;
  vendor_id?: string;
  install_date?: string;
  location: string;
  gps_lat?: number;
  gps_lng?: number;
  warranty_period?: number;
  health_score?: number;
  predicted_rul?: number;
  status: string;
  condition: string;
  qr_code?: string;
  metadata?: {
    serial_number?: string;
    model?: string;
    manufacturer?: string;
    technical_specs?: string;
    last_maintenance?: string;
    next_maintenance?: string;
    maintenance_schedule?: string;
    purchase_cost?: number;
    warranty_expiry?: string;
  };
  created_at: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface AssetListResponse {
  assets: ApiAsset[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: {
    user_id: string;
    name: string;
    email: string;
    role: string;
  };
}

class ApiService {
  private async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(AUTH_TOKEN_KEY);
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  private async setAuthToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
    } catch (error) {
      console.error('Error setting auth token:', error);
    }
  }

  private async clearAuthToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(AUTH_TOKEN_KEY);
    } catch (error) {
      console.error('Error clearing auth token:', error);
    }
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const token = await this.getAuthToken();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.detail || data.message || 'Request failed',
        };
      }

      return { data };
    } catch (error) {
      console.error('API request error:', error);
      return {
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Authentication methods
  async login(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    const response = await this.makeRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.data) {
      await this.setAuthToken(response.data.access_token);
    }

    return response;
  }

  async logout(): Promise<void> {
    await this.clearAuthToken();
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
    role?: string;
    department?: string;
  }): Promise<ApiResponse<AuthResponse>> {
    return this.makeRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Asset methods
  async getAssets(params?: {
    page?: number;
    limit?: number;
    asset_type?: string;
    location?: string;
    status?: string;
    condition?: string;
  }): Promise<ApiResponse<AssetListResponse>> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const queryString = queryParams.toString();
    const endpoint = `/assets${queryString ? `?${queryString}` : ''}`;
    
    return this.makeRequest<AssetListResponse>(endpoint);
  }

  async getAssetById(assetId: string): Promise<ApiResponse<ApiAsset>> {
    return this.makeRequest<ApiAsset>(`/assets/${assetId}`);
  }

  async searchAssetByQrCode(qrCode: string): Promise<ApiResponse<ApiAsset>> {
    // For now, we'll search by QR code using the general assets endpoint
    // Later we can create a dedicated QR search endpoint
    const response = await this.getAssets({ page: 1, limit: 100 });
    
    if (response.data) {
      const asset = response.data.assets.find(asset => asset.qr_code === qrCode);
      if (asset) {
        return { data: asset };
      } else {
        return { error: 'Asset not found for the scanned QR code' };
      }
    }
    
    return { error: response.error || 'Failed to search for asset' };
  }

  async getAssetQrCode(assetId: string): Promise<ApiResponse<{ qr_code: string }>> {
    return this.makeRequest<{ qr_code: string }>(`/assets/${assetId}/qr`);
  }

  // Inspection methods
  async getInspections(params?: {
    asset_id?: string;
    inspector_id?: string;
    result?: string;
    limit?: number;
  }): Promise<ApiResponse<any[]>> {
    let endpoint = '/inspections';
    const queryParams = new URLSearchParams();

    if (params) {
      if (params.asset_id) queryParams.append('asset_id', params.asset_id);
      if (params.inspector_id) queryParams.append('inspector_id', params.inspector_id);
      if (params.result) queryParams.append('result', params.result);
      if (params.limit) queryParams.append('limit', params.limit.toString());
    }

    const queryString = queryParams.toString();
    if (queryString) {
      endpoint += `?${queryString}`;
    }

    return this.makeRequest<any[]>(endpoint);
  }

  async getInspectionAnalytics(): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/inspections/analytics/summary');
  }

  async createInspection(inspectionData: {
    asset_id: string;
    location: string;
    inspection_type: string;
    notes?: string;
    image?: any;
  }): Promise<ApiResponse<any>> {
    return this.makeRequest<any>('/inspections', {
      method: 'POST',
      body: JSON.stringify(inspectionData),
    });
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string }>> {
    return this.makeRequest<{ status: string }>('/health');
  }

  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAuthToken();
    return !!token;
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;