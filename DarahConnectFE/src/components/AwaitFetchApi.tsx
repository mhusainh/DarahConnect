import React, { useEffect, ReactNode } from 'react';
import { useApi, ApiState } from '../hooks/useApi';
import { RequestOptions } from '../services/fetchApi';

// Interface untuk props
export interface AwaitFetchApiProps<T = any> {
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  data?: any;
  options?: RequestOptions;
  autoFetch?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: string) => void;
  children: (state: ApiState<T> & { refetch: () => void }) => ReactNode;
}

// Component untuk await fetch API
export function AwaitFetchApi<T = any>({
  endpoint,
  method = 'GET',
  data,
  options,
  autoFetch = true,
  onSuccess,
  onError,
  children,
}: AwaitFetchApiProps<T>) {
  const api = useApi<T>();

  // Fungsi untuk melakukan fetch
  const fetchData = async () => {
    let response;
    
    switch (method) {
      case 'GET':
        response = await api.get(endpoint, options);
        break;
      case 'POST':
        response = await api.post(endpoint, data, options);
        break;
      case 'PUT':
        response = await api.put(endpoint, data, options);
        break;
      case 'PATCH':
        response = await api.patch(endpoint, data, options);
        break;
      case 'DELETE':
        response = await api.delete(endpoint, options);
        break;
      default:
        return;
    }

    if (response.success && onSuccess && response.data !== undefined) {
      onSuccess(response.data);
    } else if (!response.success && onError) {
      onError(response.error || 'Unknown error');
    }
  };

  // Auto fetch saat component mount
  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [endpoint, method, autoFetch]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      {children({
        ...api,
        refetch: fetchData,
      })}
    </>
  );
}

// HOC untuk fetch API
export interface WithFetchApiProps<T = any> {
  api: ApiState<T> & { refetch: () => void };
}

export function withFetchApi<T = any, P = {}>(
  WrappedComponent: React.ComponentType<P & WithFetchApiProps<T>>,
  fetchConfig: Omit<AwaitFetchApiProps<T>, 'children'>
) {
  return function WithFetchApiComponent(props: P) {
    return (
      <AwaitFetchApi<T> {...fetchConfig}>
        {(api) => <WrappedComponent {...props} api={api} />}
      </AwaitFetchApi>
    );
  };
}

export default AwaitFetchApi; 