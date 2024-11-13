import { useEffect, useState, useCallback } from 'react';
import { TFA_STATUS } from '../utils/constants';

export const useGetTfaStatus = (userId: string) => {
  const [tfaStatus, setTfaStatus] = useState<boolean | null>(null);

  const fetchTfaStatus = useCallback(
    async (retry = 2) => {
      if (!userId) return;
      try {
        const response = await fetch(`${TFA_STATUS}${userId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });
        if (!response.ok) {
          if (response.status === 401 && retry > 0) {
            return fetchTfaStatus(retry - 1);
          }
          console.error('Error fetching TFA status:', response.statusText);
          return;
        }

        const data = await response.json();
        setTfaStatus(data);
      } catch (error) {
        console.error('Error fetching TFA status:', error);
        setTfaStatus(null);
      }
    },
    [userId],
  );

  useEffect(() => {
    fetchTfaStatus();
  }, [fetchTfaStatus]);

  return { tfaStatus, refetch: fetchTfaStatus };
};
