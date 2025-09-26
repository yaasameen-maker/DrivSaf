// src/services/api.ts
import axios, { AxiosResponse } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor for adding auth tokens (future use)
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token when available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Type definitions
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  licenseNumber?: string;
  licenseState?: string;
  darkMode?: boolean;
}

export interface Vehicle {
  id: string;
  userId: string;
  make?: string;
  model?: string;
  year?: string;
  vin?: string;
  licensePlate?: string;
  color?: string;
}

export interface Insurance {
  id: string;
  userId: string;
  provider?: string;
  policyNumber?: string;
  groupNumber?: string;
  effectiveDate?: string;
  expirationDate?: string;
  coverageType?: string;
  deductible?: string;
}

export interface Trip {
  id: string;
  userId: string;
  vehicleId?: string;
  tripId: string;
  startTime: string;
  endTime?: string;
  distance: number;
  duration: number;
  averageSpeed: number;
  maxSpeed: number;
  speedViolations: number;
  hardBraking: number;
  rapidAcceleration: number;
  safetyScore: number;
  mapProvider?: string;
  isActive: boolean;
}

export interface Alert {
  id: string;
  userId: string;
  tripId?: string;
  type: 'speed' | 'success' | 'info' | 'warning';
  message: string;
  timestamp: string;
  isRead: boolean;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  speed: number;
  speedLimit: number;
  timestamp?: string;
}

// API Service Class
class ApiService {
  // User endpoints
  async createUser(userData: Omit<User, 'id'>): Promise<User> {
    const response: AxiosResponse<User> = await apiClient.post('/users', userData);
    return response.data;
  }

  async getUser(userId: string): Promise<User> {
    const response: AxiosResponse<User> = await apiClient.get(`/users/${userId}`);
    return response.data;
  }

  async updateUser(userId: string, userData: Partial<User>): Promise<User> {
    const response: AxiosResponse<User> = await apiClient.put(`/users/${userId}`, userData);
    return response.data;
  }

  async getUserDashboard(userId: string): Promise<any> {
    const response = await apiClient.get(`/users/${userId}/dashboard`);
    return response.data;
  }

  // Vehicle endpoints
  async createVehicle(vehicleData: Omit<Vehicle, 'id'>): Promise<Vehicle> {
    const response: AxiosResponse<Vehicle> = await apiClient.post('/vehicles', vehicleData);
    return response.data;
  }

  async updateVehicle(vehicleId: string, vehicleData: Partial<Vehicle>): Promise<Vehicle> {
    const response: AxiosResponse<Vehicle> = await apiClient.put(`/vehicles/${vehicleId}`, vehicleData);
    return response.data;
  }

  async getUserVehicles(userId: string): Promise<Vehicle[]> {
    const response: AxiosResponse<Vehicle[]> = await apiClient.get(`/vehicles/user/${userId}`);
    return response.data;
  }

  // Insurance endpoints
  async createInsurance(insuranceData: Omit<Insurance, 'id'>): Promise<Insurance> {
    const response: AxiosResponse<Insurance> = await apiClient.post('/insurance', insuranceData);
    return response.data;
  }

  async updateInsurance(insuranceId: string, insuranceData: Partial<Insurance>): Promise<Insurance> {
    const response: AxiosResponse<Insurance> = await apiClient.put(`/insurance/${insuranceId}`, insuranceData);
    return response.data;
  }

  async getUserInsurance(userId: string): Promise<Insurance[]> {
    const response: AxiosResponse<Insurance[]> = await apiClient.get(`/insurance/user/${userId}`);
    return response.data;
  }

  // Trip endpoints
  async startTrip(tripData: {
    userId: string;
    vehicleId?: string;
    mapProvider?: string;
    startTime: string;
  }): Promise<Trip> {
    const response: AxiosResponse<Trip> = await apiClient.post('/trips/start', tripData);
    return response.data;
  }

  async updateTrip(tripId: string, tripData: Partial<Trip>): Promise<Trip> {
    const response: AxiosResponse<Trip> = await apiClient.put(`/trips/${tripId}`, tripData);
    return response.data;
  }

  async endTrip(tripId: string): Promise<Trip> {
    const response: AxiosResponse<Trip> = await apiClient.post(`/trips/${tripId}/end`);
    return response.data;
  }

  async getTrip(tripId: string): Promise<Trip> {
    const response: AxiosResponse<Trip> = await apiClient.get(`/trips/${tripId}`);
    return response.data;
  }

  async getUserTrips(userId: string, page = 1, limit = 10, active?: boolean): Promise<{
    trips: Trip[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    if (active !== undefined) {
      params.append('active', active.toString());
    }
    
    const response = await apiClient.get(`/trips/user/${userId}?${params}`);
    return response.data;
  }

  async addLocationData(tripId: string, locationData: LocationData): Promise<any> {
    const response = await apiClient.post(`/trips/${tripId}/location`, locationData);
    return response.data;
  }

  async exportTrip(tripId: string, insuranceProvider: string): Promise<any> {
    const response = await apiClient.post(`/trips/${tripId}/export`, { insuranceProvider });
    return response.data;
  }

  // Alert endpoints
  async getUserAlerts(userId: string, unreadOnly = false): Promise<Alert[]> {
    const params = unreadOnly ? '?unreadOnly=true' : '';
    const response: AxiosResponse<Alert[]> = await apiClient.get(`/alerts/user/${userId}${params}`);
    return response.data;
  }

  async markAlertAsRead(alertId: string): Promise<Alert> {
    const response: AxiosResponse<Alert> = await apiClient.put(`/alerts/${alertId}/read`);
    return response.data;
  }

  async createAlert(alertData: {
    userId: string;
    tripId?: string;
    type: string;
    message: string;
  }): Promise<Alert> {
    const response: AxiosResponse<Alert> = await apiClient.post('/alerts', alertData);
    return response.data;
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;