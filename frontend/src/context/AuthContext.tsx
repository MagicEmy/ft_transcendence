import React, { createContext, useState, useEffect, ReactNode } from 'react';
import useStorage from '../hooks/useStorage';
import Cookies from 'js-cookie';

interface AuthContextType {
  authToken: string | null;
  isLogged: boolean;
  setIsLogged: React.Dispatch<React.SetStateAction<boolean>>;
}

const AuthContext = createContext<AuthContextType>({
  authToken: null,
  isLogged: false,
  setIsLogged: () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

const AuthProvider = ({ children }: AuthProviderProps) => {
  const [authToken, setAuthToken] = useStorage<string | null>('authToken', null);
  const [isLogged, setIsLogged] = useState(false);

  const authTokenFromCookie = Cookies.get('Authentication');

  useEffect(() => {
    if (authTokenFromCookie) {
      setIsLogged(true);
      setAuthToken(authTokenFromCookie);
    } else {
      setIsLogged(false);
    }
  }, [authTokenFromCookie, setAuthToken]);

  return (
    <AuthContext.Provider value={{ authToken, isLogged, setIsLogged }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
