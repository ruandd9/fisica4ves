import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token em todas as requisições
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar erros de resposta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token inválido ou expirado
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  register: (name: string, email: string, password: string) =>
    api.post('/auth/register', { name, email, password }),
  
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  getMe: () =>
    api.get('/auth/me'),
};

// Apostilas endpoints
export const apostilasAPI = {
  getAll: (params?: { category?: string; search?: string }) =>
    api.get('/apostilas', { params }),
  
  getById: (id: string) =>
    api.get(`/apostilas/${id}`),
  
  getByCategory: (category: string) =>
    api.get(`/apostilas/category/${category}`),
};

// Purchases endpoints
export const purchasesAPI = {
  createPaymentIntent: (apostilaId: string) =>
    api.post('/purchases/create-payment-intent', { apostilaId }),
  
  confirmPurchase: (apostilaId: string, paymentIntentId: string) =>
    api.post('/purchases/confirm', { apostilaId, paymentIntentId }),
  
  getUserPurchases: () =>
    api.get('/purchases/user'),
  
  getById: (id: string) =>
    api.get(`/purchases/${id}`),
};

export default api;
