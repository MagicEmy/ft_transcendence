import { useEffect, useState, useCallback } from 'react';
import { TFA_STATUS } from '../utils/constants';

export const useGetTfaStatus = (userId: string) => {
  const [tfaStatus, setTfaStatus] = useState<boolean | null>(null);

  const fetchTfaStatus = useCallback(async () => {
    if (!userId) return;
    try {
      const response = await fetch(`${TFA_STATUS}${userId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        console.log(data)
        setTfaStatus(data);
      } else {
        setTfaStatus(null);
      }
    } catch (error) {
      console.error('Error fetching TFA status:', error);
      setTfaStatus(null);
    }
  }, [userId]);

  useEffect(() => {
    fetchTfaStatus();
  }, [fetchTfaStatus]);

  return { tfaStatus, refetch: fetchTfaStatus };
};
