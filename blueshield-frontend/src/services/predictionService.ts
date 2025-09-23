interface PredictionRequest {
  latitude: number;
  longitude: number;
  prediction_type: string;
}

interface PredictionResponse {
  concentration: number;
  confidence: number;
  risk_level: 'low' | 'medium' | 'high';
  timestamp: string;
  location: {
    lat: number;
    lng: number;
  };
  // Additional detailed fields from backend
  risk_description?: string;
  region_factor?: string;
  model_version?: string;
  data_sources?: string[];
  prediction_uncertainty?: number;
  seasonal_factor?: number;
  distance_from_major_rivers_km?: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class PredictionService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}/api/v1${endpoint}`;
    
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add auth token if available
    const token = localStorage.getItem('access_token');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    console.log('PredictionService: Making request to:', url);
    console.log('PredictionService: Headers:', defaultHeaders);
    console.log('PredictionService: Options:', options);

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    console.log('PredictionService: Response status:', response.status);
    console.log('PredictionService: Response ok:', response.ok);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('PredictionService: Error response:', errorData);
      
      if (response.status === 403) {
        throw new Error('Authentication required. Please sign in to make predictions.');
      } else if (response.status === 401) {
        throw new Error('Session expired. Please sign in again.');
      }
      
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('PredictionService: Success response:', result);
    return result;
  }

  async predictMicroplasticConcentration(
    latitude: number,
    longitude: number
  ): Promise<PredictionResponse> {
    const request: PredictionRequest = {
      latitude,
      longitude,
      prediction_type: 'mp_concentration',
    };

    console.log('PredictionService: Making request to backend with:', request);
    console.log('API Base URL:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000');
    
    return this.makeRequest<PredictionResponse>('/predictions/microplastic', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getPredictionHistory(limit: number = 10): Promise<PredictionResponse[]> {
    const response = await this.makeRequest<{ predictions: PredictionResponse[] }>(
      `/predictions/history?limit=${limit}`
    );
    return response.predictions;
  }
}

export const predictionService = new PredictionService();
export type { PredictionRequest, PredictionResponse };
