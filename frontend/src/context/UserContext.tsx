import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { extractUserIdFromToken, TokenUserDetails } from '../utils/tokenUtils';
import useStorage from '../hooks/useStorage';
import Cookies from 'js-cookie';

interface UserContextType {
  userDetails: TokenUserDetails | null;
  setUser: React.Dispatch<React.SetStateAction<TokenUserDetails | null>>;
}

const UserContext = createContext<UserContextType>({
  userDetails: null,
  setUser: () => {},
});

interface UserProviderProps {
  children: ReactNode;
}

const UserProvider = ({ children }: UserProviderProps) => {
  const [userDetails, setUserDetails] = useState<TokenUserDetails | null>(null);
  const [, setUserDetailsStore] = useStorage<TokenUserDetails | null>('userDetails', null);
  const [authToken, setAuthToken] = useState<string | null>(Cookies.get('Authentication') || null);

  useEffect(() => {
    const handleAuthTokenChange = () => {
      const newAuthToken = Cookies.get('Authentication') || null;
      setAuthToken(newAuthToken);
    };

    // Listen for changes to cookies
    const intervalId = setInterval(handleAuthTokenChange, 1000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    console.log('Auth Token:', authToken);

    if (authToken) {
      const userDetails = extractUserIdFromToken(authToken);
      if (userDetails) {
        setUserDetails(userDetails);
        setUserDetailsStore(userDetails);
        console.log('User Details:', userDetails);
      } else {
        console.log('Failed to extract user details from token');
      }
    } else {
      console.log('No auth token found');
    }
  }, [authToken]);

  return (
    <UserContext.Provider value={{ userDetails, setUser: setUserDetails }}>
      {children}
    </UserContext.Provider>
  );
};

export { UserContext, UserProvider };
