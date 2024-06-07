import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types/shared';
import { BASE_URL } from '../utils/constants';

export const useGetProfile = (userId: string) => {
  const [profile, setProfile] = useState<UserProfile>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const fetchDbProfile = async () => {
      setIsLoading(true);
      const response = await fetch(`${BASE_URL}/profile/${userId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      setIsLoading(false);
      if (!response.ok) {
        setError(`Error: ${response.status}`);
        return;
      }
      const profileData: UserProfile = await response.json();
      setProfile(profileData);
    };

    fetchDbProfile();
  }, [userId]);

  return { profile, isLoading, error };

};
