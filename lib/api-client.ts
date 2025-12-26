import axios, { AxiosInstance, AxiosError } from 'axios';

/**
 * Shared axios client for calling Next.js API routes
 * This keeps API credentials secure on the server side
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: '',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for consistent error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const errorObject = error.response.data as any;
      const errorMessage =
        errorObject?.error?.message ||
        errorObject?.message ||
        error.message ||
        'An error occurred';
      throw new Error(errorMessage);
    }
    throw error;
  }
);
