import React, { useState, useEffect } from 'react';
import { loadProfileAvatar } from '../utils/profileUtils';

export const useGetAvatar = (userId: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [avatar, setAvatar] = useState<string>();
  const [error, setError] = useState<string>();

  useEffect(() => {
    const getAvatar = async () => {
      setIsLoading(true);
      const imageUrl = await loadProfileAvatar(userId);
      setIsLoading(false);
      if (!imageUrl) {
        setError(`Error fetching the image url`);
        return;
      }
      setAvatar(imageUrl);
    };

    getAvatar();
  }, [userId]);

  return { avatar, isLoading, error };
}
