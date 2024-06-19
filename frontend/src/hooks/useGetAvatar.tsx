import { useState, useEffect, useContext, useRef } from 'react';
import { loadProfileAvatar } from '../utils/profileUtils';
import UserContext, { IUserContext } from '../context/UserContext';

export const useGetAvatar = (userId: string) => {
  const { avatarContext, setAvatarContext } = useContext<IUserContext>(UserContext);
  const [isLoading, setIsLoading] = useState(false);
  const [avatar, setAvatar] = useState<string | undefined>();
  const [error, setError] = useState<string>('');
  const prevUserIdRef = useRef<string | null>(null);

  useEffect(() => {
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

    if (prevUserIdRef.current !== userId) {
      fetchAvatar();
    }

    prevUserIdRef.current = userId;

    return () => {
      active = false;
      cleanupPreviousAvatar();
    };
  }, [userId]);

  return { avatar, isLoading, error };
};
