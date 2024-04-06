import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import jwtDecode from 'js-jwt';

const storageKey = 'your_app_jwt_token'; // Replace with a unique key for your app

const AuthContext = createContext({
  authToken: null,
  setAuthToken: () => {},
  isLoading: false,
  setIsLoading: () => {},
});

export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchToken = async () => {
    setIsLoading(true);
    try {
      const instance = axios.create({
        baseURL: 'http://localhost:3001/auth/42/redirect', // Replace with your actual backend URL
      });
      const response = await instance.get('/auth/42/redirect');
      const data = response.data;
      setAuthToken(data.access_token);
      localStorage.setItem(storageKey, data.access_token); // Store token in local storage
      // Optionally set an expiration time using localStorage.setItem(storageKey, JSON.stringify({ token: data.access_token, expiresAt: Date.now() + expiryTime }));
    } catch (error) {
      console.error('Error fetching token:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkAndRefreshToken = () => {
    if (authToken) {
      const decodedToken = jwtDecode(authToken);
      const expiryInMilliseconds = decodedToken.exp * 1000; // Convert seconds to milliseconds
      const isExpired = expiryInMilliseconds < Date.now();
      if (isExpired) {
        // Token expired, refresh token
        fetchToken(); // Re-fetch token from backend
      }
    }
  };

  useEffect(() => {
    const storedToken = localStorage.getItem(storageKey);
    if (storedToken) {
      setAuthToken(storedToken);
      // Optionally check expiration time here (if implemented) and refresh if needed
    } else {
      fetchToken();
    }
  }, []);

  return (
    <AuthContext.Provider value={{ authToken, setAuthToken, isLoading, setIsLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
/*
Explanation:

    We've added a storageKey constant to store the token in local storage using localStorage.setItem.
    Inside fetchToken, we store the fetched token in local storage after setting the state.
    We've commented out an optional approach to set an expiration time along with the token in local storage using JSON.stringify. You can implement this by setting an expiry time (e.g., Date.now() + expiryTime) and checking it in checkAndRefreshToken.
    The useEffect hook checks for a stored token in local storage on component mount. If found, it sets the state and allows for optional expiration checking (if implemented in checkAndRefreshToken).

2. Secure Storage Mechanisms:

Many frontend frameworks offer secure storage mechanisms beyond basic local storage. Here are some examples:

    React Native: Use AsyncStorage for secure storage on mobile devices.
    Angular: Utilize the @angular/service-worker and SecureStorage for secure token storage within a Service Worker environment.
    Vue.js: Explore libraries like vue-localstorage that offer encrypted storage functionalities.

Security Considerations:

    Local storage is not completely secure as data can be accessed through browser developer tools. Consider using secure storage mechanisms provided by your framework for enhanced protection.
    If you implement token expiration checking, ensure proper logic for refreshing tokens to avoid interruptions.
    Be cautious about the information stored in the token. Avoid storing sensitive user data within the JWT.

Remember:

    Replace placeholders like your_app_jwt_token and http://localhost:3001/auth/42/redirect with your actual values.
    Choose a suitable secure storage mechanism based on your frontend framework for better security.
    Implement proper token management and refresh logic to ensure a smooth user experience.

    */
