import { useState, useCallback } from 'react';
import { ApiError } from '../services/api';

interface ApiState<T> {
  data: T | null;
  error: ApiError | null;
  isLoading: boolean;
}

interface UseApiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: ApiError) => void;
}

export function useApi<T = any>(options: UseApiOptions = {}) {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    error: null,
    isLoading: false
  });

  const execute = useCallback(async (
    apiCall: () => Promise<T>,
    { onSuccess, onError } = options
  ) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const data = await apiCall();
      setState({ data, error: null, isLoading: false });
      onSuccess?.(data);
      return data;
    } catch (error) {
      const apiError = error instanceof ApiError ? error : new ApiError(500, 'Une erreur inattendue est survenue');
      setState({ data: null, error: apiError, isLoading: false });
      onError?.(apiError);
      throw apiError;
    }
  }, [options]);

  const reset = useCallback(() => {
    setState({ data: null, error: null, isLoading: false });
  }, []);

  return {
    ...state,
    execute,
    reset,
    isError: !!state.error,
    isSuccess: !!state.data && !state.error
  };
}

// Hook spécifique pour les requêtes GET
export function useGet<T = any>(url: string, options: UseApiOptions = {}) {
  const { execute, ...state } = useApi<T>(options);

  const fetch = useCallback(async (params?: Record<string, any>) => {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    const fullUrl = queryString ? `${url}?${queryString}` : url;
    
    return execute(async () => {
      const response = await fetch(fullUrl);
      if (!response.ok) {
        throw new ApiError(response.status, 'Erreur lors de la récupération des données');
      }
      return response.json();
    });
  }, [url, execute]);

  return {
    ...state,
    fetch
  };
}

// Hook spécifique pour les requêtes POST
export function usePost<T = any>(url: string, options: UseApiOptions = {}) {
  const { execute, ...state } = useApi<T>(options);

  const post = useCallback(async (data: any) => {
    return execute(async () => {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new ApiError(response.status, 'Erreur lors de l\'envoi des données');
      }
      
      return response.json();
    });
  }, [url, execute]);

  return {
    ...state,
    post
  };
} 