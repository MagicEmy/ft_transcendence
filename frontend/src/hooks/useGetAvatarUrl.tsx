import { useState, useEffect, useContext } from 'react';
import { loadProfileAvatar } from '../utils/profileUtils';
import UserContext, { IUserContext } from '../context/UserContext';

export const useGetAvatarUrl = (userId: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [avatar, setAvatar] = useState<string | undefined>();
  const [error, setError] = useState<string>('');

  useEffect(() => {
    console.log("useGetAvatar userId: ", userId);
    let active = true; // Flag to manage the effect lifecycle

    const fetchAvatar = async () => {
        try {
          const url = await loadProfileAvatar(userId);

          if (url) {
            setAvatar(url);
          }
        } catch (error) {
          if (active) setError(`Error loading avatar: ${error}`);
        } finally {
          if (active) setIsLoading(false);
        }
      }

    fetchAvatar();

  }, [userId]);

  return { avatar, isLoading, error };
};
