import { createContext, useState, useEffect, ReactNode } from 'react';
import useStorage from '../hooks/useStorage';
import { loadProfileAvatar } from '../utils/profileUtils';
import { Friends } from '../types/shared';
import { USER } from '../utils/constants';
import { IUserContext } from '../context/userContext.types';

const defaultState: IUserContext = {
  userIdContext: '',
  setUserIdContext: () => {},
  userNameContext: '',
  setUserNameContext: () => {},
  avatarContext: null,
  setAvatarContext: () => {},
  friendsContext: [],
  setFriendsContext: () => {},
  isLoading: false,
};

const UserContext = createContext<IUserContext>(defaultState);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [userIdContext, setUserIdContext] = useState<string>('');
  const [userIdStorage, setUserIdStorage] = useStorage<string>('userId', '');
  const [, setUserNameStorage] = useStorage<string>('userName', '');
  const [userNameContext, setUserNameContext] = useState<string>('');
  const [avatarContext, setAvatarContext] = useState<string | null>(null);
  const [friendsContext, setFriendsContext] = useState<Friends[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(USER, {
          method: 'GET',
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const profile = await response.json();
        setUserIdContext(profile.userId);
        if (profile.userId) setUserIdStorage(profile.userId);
        if (profile.userName) setUserNameStorage(profile.userName);
        setUserNameContext(profile.userName);
      } catch (error) {
        console.error('Error fetching user data: error caught: ', error);
      } finally {
        setIsLoading(false);
      }
    };
    if (!userIdContext) fetchUser();
  }, []);

  useEffect(() => {
    if (userIdContext && userIdStorage && userIdContext !== userIdStorage) {
      setUserIdStorage(userIdContext);
    }
  }, [userIdContext, userIdStorage, setUserIdStorage]);

  useEffect(() => {
    const fetchAvatar = async () => {
      if (userIdStorage) {
        try {
          const url = await loadProfileAvatar(userIdStorage);
          if (url) {
            setAvatarContext(url);
          }
        } catch (error) {
          console.error('Error loading avatar:', error);
        }
      }
    };

    fetchAvatar();
  }, [userIdStorage]);

  return (
    <UserContext.Provider
      value={{
        userIdContext,
        setUserIdContext,
        userNameContext,
        setUserNameContext,
        avatarContext,
        setAvatarContext,
        friendsContext,
        setFriendsContext,
        isLoading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
export type { IUserContext };
