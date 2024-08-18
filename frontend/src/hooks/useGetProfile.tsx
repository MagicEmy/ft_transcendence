import { useState, useEffect, useCallback } from 'react';
import { UserProfile } from '../types/shared';
import { USER } from '../utils/constants';

export const useGetProfile = (userId: string) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<number | null>(null);
  const fetchDbProfile = useCallback(
    async (retry = 2) => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`${USER}/${userId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        });

        if (!response.ok) {
          if (response.status === 401 && retry > 0) {
            return fetchDbProfile(retry - 1);
          } else {
            setError(response.status);
          }
        }
        const profileData: UserProfile = await response.json();
        setProfile(profileData);
      } catch (e) {
        const errorStatus = e instanceof Error ? parseInt(e.message) : 500;
        setError(errorStatus);
      } finally {
        setIsLoading(false);
      }
    },
    [userId],
  );

  useEffect(() => {
    fetchDbProfile();
  }, [fetchDbProfile]);

  return { profile, error, isLoading };
};
