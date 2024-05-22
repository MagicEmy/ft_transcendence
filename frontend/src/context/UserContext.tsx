import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { loadProfileAvatar } from '../utils/profileUtils';

interface IUserContext {
  userIdContext: string;
  userNameContext: string;
  setUserNameContext: (userName: string) => void;
  avatarContext: string | null;
  setAvatarContext: (avatar: string | null) => void;
  tfaEnabled: boolean;
  setTfaEnabled: (isEnabled: boolean) => void;
  isLoading: boolean;
}

const defaultState: IUserContext = {
  userIdContext: '',
  userNameContext: '',
  setUserNameContext: () => {},
  avatarContext: null,
  setAvatarContext: () => {},
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
  const [userNameContext, setUserNameContext] = useState<string>('');
  const [avatarContext, setAvatarContext] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [tfaEnabled, setTfaEnabled] = useState<boolean>(false);

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("http://localhost:3003/auth/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const profile = await response.json();
        setUserIdContext(profile.userId);
        setUserNameContext(profile.userName);
      } catch (error) {
        console.error("Error fetching user data: error caught: ", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (!userIdContext) fetchUser();
  }, [userIdContext]);

  useEffect(() => {
    let active = true; // Flag to manage the effect lifecycle

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
  }, [userIdContext, setAvatarContext, avatarContext]);

  return (
    <UserContext.Provider
      value={{
        userIdContext,
        userNameContext,
        setUserNameContext,
        avatarContext,
        setAvatarContext,
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
