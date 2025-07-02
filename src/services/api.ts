import { getToken } from '../utils/auth';

const API_BASE_URL = import.meta.env.VITE_API_HOST || 'http://localhost:8080';

interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getToken();
  const headers = new Headers({
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  });

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      return {
        error: data.message || 'Ocorreu um erro inesperado',
        status: response.status,
      };
    }

    return { data, status: response.status };
  } catch (error) {
    console.error('API Request Error:', error);
    return {
      error: 'Erro de conexão. Verifique sua internet e tente novamente.',
      status: 0,
    };
  }
}

export const api = {
  // Diets
  createDiet: (data: any) => 
    apiRequest('/v1/diets', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getDiets: () => 
    apiRequest<{ diets: any[] }>('/v1/diets'),

  getDiet: (id: string) => 
    apiRequest<{ diet: any }>(`/v1/diets/${id}`),

  updateDiet: (id: string, data: any) => 
    apiRequest(`/v1/diets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteDiet: (id: string) => 
    apiRequest(`/v1/diets/${id}`, {
      method: 'DELETE',
    }),

  // Users
  login: (email: string, password: string) =>
    apiRequest<{ token: string; user: any }>('/v1/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (userData: any) =>
    apiRequest<{ user: any }>('/v1/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  getCurrentUser: () =>
    apiRequest<{ user: any }>('/v1/users/me'),
};

export default api;
