import React, { useState, useEffect } from 'react';
import AuthContext from './AuthContext';

const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    isLoggedIn: false,
    user: null,
    token: null,
  });
  // Function to simulate login
  const login = (userData) => {
    setAuthState({
      isLoggedIn: true,
      user: userData.user,
      token: userData.token,
    });
  };

  // Function to simulate logout
  const logout = () => {
    setAuthState({
      isLoggedIn: false,
      user: null,
      token: null,
    });
  };
  useEffect(() => {
    // Check local storage for auth token on initial load
    const token = localStorage.getItem('token');
    if (token) {
		// Set user and token from local storage
		setAuthState((prevState) => ({
		  ...prevState,
		  isLoggedIn: true,
		  token: token,
		  // verify the token on the backend
		}));
	  }
	}, []);

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;