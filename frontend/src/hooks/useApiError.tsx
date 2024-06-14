import { useState, useCallback } from 'react';

interface ApiError {
  status: number;
  message: string;
}

export const useApiError = () => {
  const [apiError, setApiError] = useState<ApiError | null>(null);

  const handleError = useCallback((error: any) => {
    if (error.response) {
      // Server responded with a status other than 200 range
      setApiError({
        status: error.response.status,
        message: error.response.data.message || 'An error occurred',
      });
    } else if (error.request) {
      // Request was made but no response was received
      setApiError({
        status: 500,
        message: 'No response received from the server',
      });
    } else {
      // Something else caused the error
      setApiError({
        status: 500,
        message: error.message || 'An unknown error occurred',
      });
    }
  }, []);

  return { apiError, handleError, setApiError };
};
