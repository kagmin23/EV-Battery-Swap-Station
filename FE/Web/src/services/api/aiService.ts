import axios from 'axios';

const API_BASE_URL = 'http://localhost:8001/api';

export interface ForecastPoint {
  hour: number;
  timestamp: string;
  predicted_demand: number;
  confidence: number;
}

export interface ForecastSummary {
  avg_demand: number;
  peak_demand: number;
  min_demand: number;
}

export interface DemandForecastResponse {
  station_id: string;
  forecast_periods: number;
  generated_at: string;
  forecast: ForecastPoint[];
  summary: ForecastSummary;
}

export interface CapacityAnalysis {
  current_capacity: number;
  recommended_capacity: number;
  capacity_gap: number;
  gap_percentage: string;
}

export interface UtilizationAnalysis {
  current: number;
  forecast_avg: string;
  forecast_peak: string;
}

export interface DemandAnalysis {
  peak_demand: number;
  avg_demand: string;
  min_demand: string;
}

export type RecommendationUrgency = 'low' | 'medium' | 'high';

export interface CapacityRecommendationDetail {
  needs_upgrade: boolean;
  urgency: RecommendationUrgency;
  priority: number;
  reasoning: string;
}

export interface CapacityRecommendation {
  station_id: string;
  station_name: string;
  analysis: CapacityAnalysis;
  utilization: UtilizationAnalysis;
  demand_analysis: DemandAnalysis;
  recommendation: CapacityRecommendationDetail;
  generated_at: string;
}

export interface AllRecommendationsSummary {
  total_stations: number;
  analyzed_stations: number;
  needs_upgrade: number;
  high_priority: number;
  recommendations: CapacityRecommendation[];
  generated_at: string;
}

export interface ModelStatus {
  model_exists: boolean;
  status: 'ready' | 'not_trained';
  trained_at: string | null;
  evaluation: {
    mae?: number;
    rmse?: number;
    mape?: number;
  } | null;
}

export interface TrainModelPayload {
  stationId?: string | null;
  daysBack?: number;
  forceRetrain?: boolean;
}

export interface TrainModelResponse {
  success: boolean;
  message: string;
  data: {
    success: boolean;
    dataSize: number;
    trainingSamples: number;
    validationSamples: number;
    evaluation: {
      mae: number;
      rmse: number;
      mape: number;
    };
    parameters: Record<string, unknown>;
  };
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const handleAxiosError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      const status = error.response.status;
      const responseMessage = error.response.data?.message;
      const message = responseMessage || 'Server error';

      switch (status) {
        case 400:
          throw new Error(`Bad Request: ${message}`);
        case 401:
          throw new Error('Unauthorized: Please login again');
        case 403:
          throw new Error('Forbidden: You do not have permission to perform this action');
        case 404:
          throw new Error('Not Found: Resource not found');
        case 409:
          throw new Error(`Conflict: ${message}`);
        case 422:
          throw new Error(`Validation Error: ${message}`);
        case 500:
          throw new Error(responseMessage ? responseMessage : 'Internal Server Error: Please try again later');
        default:
          throw new Error(`Error ${status}: ${message}`);
      }
    } else if (error.request) {
      throw new Error('Network Error: Please check your internet connection');
    }
    throw new Error(`Request Error: ${error.message}`);
  }
  throw new Error('An unexpected error occurred');
};

export class AIService {
  static async forecastDemand(stationId: string, periods: number): Promise<DemandForecastResponse> {
    try {
      const response = await api.post('/ai/forecast/demand', { stationId, periods });
      if (response.data.success) {
        return response.data.data as DemandForecastResponse;
      }
      throw new Error(response.data.message || 'Failed to forecast demand');
    } catch (error) {
      handleAxiosError(error);
      throw error;
    }
  }

  static async getCapacityRecommendation(stationId: string, bufferRate: number): Promise<CapacityRecommendation> {
    try {
      const response = await api.post('/ai/recommendations/capacity', { stationId, bufferRate });
      if (response.data.success) {
        return response.data.data as CapacityRecommendation;
      }
      throw new Error(response.data.message || 'Failed to get capacity recommendation');
    } catch (error) {
      handleAxiosError(error);
      throw error;
    }
  }

  static async getAllRecommendations(): Promise<AllRecommendationsSummary> {
    try {
      const response = await api.get('/ai/recommendations/all');
      if (response.data.success) {
        return response.data.data as AllRecommendationsSummary;
      }
      throw new Error(response.data.message || 'Failed to get recommendations');
    } catch (error) {
      handleAxiosError(error);
      throw error;
    }
  }

  static async trainModel(payload: TrainModelPayload): Promise<TrainModelResponse> {
    try {
      const response = await api.post('/ai/train', payload);
      if (response.data.success) {
        return response.data as TrainModelResponse;
      }
      throw new Error(response.data.message || 'Failed to train model');
    } catch (error) {
      handleAxiosError(error);
      throw error;
    }
  }

  static async getModelStatus(): Promise<ModelStatus> {
    try {
      const response = await api.get('/ai/model/status');
      if (response.data.success) {
        return response.data.data as ModelStatus;
      }
      throw new Error(response.data.message || 'Failed to get model status');
    } catch (error) {
      handleAxiosError(error);
      throw error;
    }
  }
}

export default AIService;

