import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../utils/constants';
import { UserStatus } from '../types/shared';

export const useGetUserStatus = (userId: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [userStatus, setUserStatus] = useState<UserStatus>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    const fetchUserStatus = async () => {
      setIsLoading(true);
      const response = await fetch(`${BASE_URL}/status/${userId}`, {
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
}
