import { useState, useEffect, useCallback } from 'react';
import { STATUS } from '../utils/constants';
import { UserStatus } from '../types/shared';

export const useGetUserStatus = (userId: string, pollingInterval = 5000) => {
  const [isLoading, setIsLoading] = useState(false);
  const [userStatus, setUserStatus] = useState<UserStatus>();
  const [error, setError] = useState<string>();

  const fetchUserStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${STATUS}/${userId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!response.ok) {
        setError(`Error: ${response.status}`);
        console.error(`Error: ${response.status}`);
        return;
      }
      const newUserStatus = await response.json();
      setUserStatus(newUserStatus);
    } catch (err) {
      console.error(`'An error occurred': ${err}`);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUserStatus();

    const intervalId = setInterval(fetchUserStatus, pollingInterval);

    return () => clearInterval(intervalId);
  }, [userId, pollingInterval, fetchUserStatus]);

  return { userStatus, isLoading, error };
};
