import { useState, useCallback } from 'react';
import { fetchApi, getApi, postApi, putApi, patchApi, deleteApi, ApiResponse, RequestOptions } from '../services/fetchApi';
import { debugConsole } from '../config/api';
import { check401Error, AuthErrorOptions } from '../utils/jwt';

// Interface untuk state API
export interface ApiState<T = any> {
  data: T | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

// Interface untuk options API call dengan auth error handling
export interface ApiCallOptions extends RequestOptions {
  authErrorOptions?: AuthErrorOptions;
}

// Hook untuk API calls dengan state management
export const useApi = <T = any>(initialData: T | null = null) => {
  const [state, setState] = useState<ApiState<T>>({
    data: initialData,
    loading: false,
    error: null,
    success: false,
  });

  // Reset state
  const reset = useCallback(() => {
    setState({
      data: initialData,
      loading: false,
      error: null,
      success: false,
    });
  }, [initialData]);

  // Execute API call with enhanced error handling
  const executeApi = useCallback(async (
    apiCall: () => Promise<ApiResponse<T>>,
    endpoint: string = 'unknown',
    options?: ApiCallOptions
  ): Promise<ApiResponse<T>> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await apiCall();
      
      if (response.success) {
        setState({
          data: response.data || null,
          loading: false,
          error: null,
          success: true,
        });
        debugConsole.success('useApi: Request berhasil', response.data);
      } else {
        // Check for 401 errors and handle them automatically
        const is401Error = check401Error(
          response.status, 
          response.error || 'Unknown error', 
          endpoint,
          options?.authErrorOptions
        );
        
        if (is401Error) {
          // For 401 errors, don't update state as user will be redirected
          debugConsole.log('useApi: 401 error handled, user will be redirected');
          return response;
        }
        
        setState({
          data: null,
          loading: false,
          error: response.error || 'Unknown error',
          success: false,
        });
        debugConsole.error('useApi: Request gagal', response.error);
      }
      
      return response;
    } catch (error: any) {
      const errorMessage = error.message || 'Network error';
      setState({
        data: null,
        loading: false,
        error: errorMessage,
        success: false,
      });
      debugConsole.error('useApi: Exception occurred', error);
      
      return {
        success: false,
        error: errorMessage,
        status: 0,
        pagination: null,
      };
    }
  }, []);

  // GET request
  const get = useCallback(async (
    endpoint: string,
    options?: ApiCallOptions
  ): Promise<ApiResponse<T>> => {
    return executeApi(() => getApi<T>(endpoint, options), endpoint, options);
  }, [executeApi]);

  // POST request
  const post = useCallback(async (
    endpoint: string,
    data?: any,
    options?: ApiCallOptions
  ): Promise<ApiResponse<T>> => {
    return executeApi(() => postApi<T>(endpoint, data, options), endpoint, options);
  }, [executeApi]);

  // PUT request
  const put = useCallback(async (
    endpoint: string,
    data?: any,
    options?: ApiCallOptions
  ): Promise<ApiResponse<T>> => {
    return executeApi(() => putApi<T>(endpoint, data, options), endpoint, options);
  }, [executeApi]);

  // PATCH request
  const patch = useCallback(async (
    endpoint: string,
    data?: any,
    options?: ApiCallOptions
  ): Promise<ApiResponse<T>> => {
    return executeApi(() => patchApi<T>(endpoint, data, options), endpoint, options);
  }, [executeApi]);

  // DELETE request
  const remove = useCallback(async (
    endpoint: string,
    options?: ApiCallOptions
  ): Promise<ApiResponse<T>> => {
    return executeApi(() => deleteApi<T>(endpoint, options), endpoint, options);
  }, [executeApi]);

  // Custom fetch
  const customFetch = useCallback(async (
    endpoint: string,
    options?: RequestInit & ApiCallOptions
  ): Promise<ApiResponse<T>> => {
    return executeApi(() => fetchApi<T>(endpoint, options), endpoint, options);
  }, [executeApi]);

  return {
    // State
    ...state,
    
    // Actions
    get,
    post,
    put,
    patch,
    delete: remove,
    customFetch,
    reset,
    
    // Alias untuk kemudahan
    fetch: customFetch,
  };
};

// Hook untuk multiple API calls
export const useMultipleApi = () => {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const executeMultiple = useCallback(async <T = any>(
    apiCalls: (() => Promise<ApiResponse<T>>)[]
  ): Promise<ApiResponse<T>[]> => {
    setLoading(true);
    setErrors([]);
    
    try {
      const responses = await Promise.allSettled(
        apiCalls.map(call => call())
      );
      
      const results: ApiResponse<T>[] = [];
      const newErrors: string[] = [];
      
      responses.forEach((response, index) => {
        if (response.status === 'fulfilled') {
          results.push(response.value);
          if (!response.value.success) {
            // Check for 401 errors in multiple API responses
            if (response.value.status === 401) {
              check401Error(
                response.value.status,
                response.value.error || 'Unauthorized',
                `Multiple API Call ${index + 1}`
              );
            } else {
              newErrors.push(`API ${index + 1}: ${response.value.error}`);
            }
          }
        } else {
          const error = `API ${index + 1}: ${response.reason?.message || 'Unknown error'}`;
          newErrors.push(error);
          results.push({
            success: false,
            error: response.reason?.message || 'Unknown error',
            status: 0,
            pagination: null,
          });
        }
      });
      
      setErrors(newErrors);
      setLoading(false);
      
      debugConsole.log(`Multiple API calls completed. Errors: ${newErrors.length}`, {
        total: apiCalls.length,
        errors: newErrors,
      });
      
      return results;
    } catch (error: any) {
      const errorMessage = error.message || 'Multiple API calls failed';
      setErrors([errorMessage]);
      setLoading(false);
      debugConsole.error('Multiple API calls failed', error);
      
      return apiCalls.map(() => ({
        success: false,
        error: errorMessage,
        status: 0,
        pagination: null,
      }));
    }
  }, []);

  return {
    loading,
    errors,
    executeMultiple,
  };
};

export default useApi; 