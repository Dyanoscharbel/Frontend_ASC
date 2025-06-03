import axios, { AxiosError, AxiosResponse, AxiosRequestConfig } from 'axios';
import envConfig from '../config/env.config';

// Configuration de base d'Axios
const axiosConfig: AxiosRequestConfig = {
  baseURL: envConfig.apiUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Important pour les cookies CORS
};

// Créer une instance axios avec la configuration de base
const api = axios.create(axiosConfig);

// Configuration du retry
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 seconde

// Fonction pour attendre
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Intercepteur pour ajouter le token d'authentification aux requêtes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse et les retries
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const config = error.config as AxiosRequestConfig & { _retryCount?: number };
    
    // Initialiser le compteur de retry si nécessaire
    config._retryCount = config._retryCount || 0;

    // Gérer les erreurs 401 (non autorisé)
    if (error.response?.status === 401) {
      // Si le token est expiré ou invalide, déconnexion
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // Gérer les erreurs de réseau ou 5xx avec retry
    if (
      (error.code === 'ECONNABORTED' || 
       (error.response?.status && error.response.status >= 500)) && 
      config._retryCount < MAX_RETRIES
    ) {
      config._retryCount += 1;
      
      // Attendre avant de réessayer
      await wait(RETRY_DELAY * config._retryCount);
      
      // Réessayer la requête
      return api(config);
    }

    return Promise.reject(error);
  }
);

// Types d'erreur personnalisés
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any,
    public isNetworkError?: boolean
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Fonction utilitaire pour gérer les erreurs
export const handleApiError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status || 500;
    const message = error.response?.data?.message || 'Une erreur est survenue';
    const isNetworkError = !error.response;
    
    throw new ApiError(status, message, error.response?.data, isNetworkError);
  }
  throw new ApiError(500, 'Une erreur inattendue est survenue');
};

// Fonction utilitaire pour vérifier la santé de l'API
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const response = await api.get('/health');
    return response.status === 200;
  } catch (error) {
    console.error('API health check failed:', error);
    return false;
  }
};

export default api; 