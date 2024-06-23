import { useState, useEffect, useContext } from 'react';
import { loadProfileAvatar } from '../utils/profileUtils';
import UserContext, { IUserContext } from '../context/UserContext';

export const useGetAvatar = (userId: string) => {
  const { avatarContext, setAvatarContext } = useContext<IUserContext>(UserContext);
  const [isLoading, setIsLoading] = useState(false);
  const [avatar, setAvatar] = useState<string | undefined>();
  const [error, setError] = useState<string>('');

  useEffect(() => {
    console.log("useGetAvatar userId: ", userId);
    let active = true; // Flag to manage the effect lifecycle

    const cleanupPreviousAvatar = () => {
      if (avatarContext) {
        URL.revokeObjectURL(avatarContext);
      }
    };

    const fetchAvatar = async () => {
      if (userId && active) {
        try {
          setIsLoading(true);
          const url = await loadProfileAvatar(userId);
          console.log("fetchAvatar url: ", url);
          if(url === avatarContext) return;
          if (url && active) {
            cleanupPreviousAvatar();
            setAvatarContext(url);
            setAvatar(url);
          } else {
            throw new Error('Failed to load image.');
          }
        } catch (error) {
          if (active) setError(`Error loading avatar: ${error}`);
        } finally {
          if (active) setIsLoading(false);
        }
      }
    };

    fetchAvatar();

    return () => {
      active = false;
      cleanupPreviousAvatar();
    };
  }, [userId]);

  return { avatar, isLoading, error };
};
