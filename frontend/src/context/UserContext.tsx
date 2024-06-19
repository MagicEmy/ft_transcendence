import { createContext, useState, useEffect, ReactNode } from 'react';
import useStorage from '../hooks/useStorage';
import { loadProfileAvatar } from '../utils/profileUtils';
import { Friends } from "../types/shared";
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
  tfaEnabled: false,
  setTfaEnabled: () => {},
  isLoading: false,
};

const UserContext = createContext<IUserContext>(defaultState);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [userIdContext, setUserIdContext] = useState<string>('');
  const [userIdStorage, setUserIdStorage, ] = useStorage<string>('userId', '');
  const [, setUserNameStorage, ] = useStorage<string>('userName', '');
  const [userNameContext, setUserNameContext] = useState<string>('');
  const [avatarContext, setAvatarContext] = useState<string | null>(null);
  const [friendsContext, setFriendsContext] = useState<Friends[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [tfaEnabled, setTfaEnabled] = useState<boolean>(false);

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(USER, {
          method: "GET",
          credentials: "include",
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
        console.error("Error fetching user data: error caught: ", error);
      } finally {
        setIsLoading(false);
      }
    };
        if (!userIdContext) fetchUser();

      }, []);


  useEffect(() => {
    let active = true;

    const cleanupPreviousAvatar = () => {
      if (avatarContext) {
        URL.revokeObjectURL(avatarContext);
      }
    };

    const fetchAvatar = async () => {
      if (userIdContext) {
        try {
          const url = await loadProfileAvatar(userIdContext);
          if (active) {
            cleanupPreviousAvatar();
            setAvatarContext(url || null);
          }
        } catch (error) {
          console.error('Error loading avatar:', error);
        }
      }
    };

    fetchAvatar();

    return () => {
      cleanupPreviousAvatar();
      active = false;
    };
  }, [userIdContext]);

  console.log("userIdContext: ", userIdContext);
  console.log("userIdStorage: ", userIdStorage);

  useEffect(() => {
    if (userIdContext && userIdStorage && userIdContext !== userIdStorage) {
      setUserIdStorage(userIdContext);
    }
  }
  , [userIdContext, userIdStorage, setUserIdStorage]);

  console.log("userIdContext2: ", userIdContext);
  console.log("userIdStorage2: ", userIdStorage);

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
        tfaEnabled,
        setTfaEnabled,
        isLoading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
export type { IUserContext };
