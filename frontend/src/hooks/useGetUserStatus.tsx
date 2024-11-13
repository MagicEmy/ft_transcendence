import { useState, useEffect, useCallback } from 'react';
import { STATUS } from '../utils/constants';
import { UserStatus } from '../types/shared';

export const useGetUserStatus = (userId: string, pollingInterval: number ) => {
  const [isLoading, setIsLoading] = useState(false);
  const [userStatus, setUserStatus] = useState<UserStatus>();
	const [error, setError] = useState<number | null>(null);

  const fetchUserStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${STATUS}/${userId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!response.ok) {
        setError(response.status);
        console.error(`Error: ${response.status}`);
        return;
      }
      const newUserStatus = await response.json();

      if (JSON.stringify(newUserStatus) !== JSON.stringify(userStatus)) {
        setUserStatus(newUserStatus);
      }
    } catch (e) {
      const errorStatus = e instanceof Error ? parseInt(e.message) : 400;
      setError(errorStatus);
    } finally {
      setIsLoading(false);
    }
  }, [userId, userStatus]);

  useEffect(() => {
    fetchUserStatus();
  }, [userId, fetchUserStatus]);

  useEffect(() => {
    const intervalId = setInterval(fetchUserStatus, pollingInterval);

    return () => clearInterval(intervalId);
  }, [pollingInterval, fetchUserStatus]);

  return { userStatus, isLoading, error };
};
