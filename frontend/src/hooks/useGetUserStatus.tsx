import { useState, useEffect } from 'react';
import { STATUS } from '../utils/constants';
import { UserStatus } from '../types/shared';

export const useGetUserStatus = (userId: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [userStatus, setUserStatus] = useState<UserStatus>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    const fetchUserStatus = async () => {
      setIsLoading(true);
      const response = await fetch(`${STATUS}/${userId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      setIsLoading(false);
      if (!response.ok) {
        setError(`Error: ${response.status}`);
        return;
      }
      const userStatus = await response.json();
      setUserStatus(userStatus);
    };

    fetchUserStatus();
  }, [userId]);

  return { userStatus, isLoading, error };
};
