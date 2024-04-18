import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext({
  authToken: null,
  setAuthToken: () => {},
  isLoading: true,
  setIsLoading: () => {},
  user: null,
  setUser: () => {},
  isLogged: false,
  setIsLogged: () => {},
});

export const AuthProvider = ({ children }) => {
	const [authToken, setAuthToken] = useState(null);
	const [user, setUser] = useState(null);
	const [isLogged, setIsLogged] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {

	    if (authToken) {
			// Replace with your logic to fetch user data based on token
			const fetchUserData = async () => {
			  try {
				const response = await axios.get('http://localhost:3003/auth/profile', {
				  headers: { Authorization: `Bearer ${authToken}` },
				});
				const data = response.data;
				setUser(data.user);
				console.log("%%%data: ", data);
				setIsLogged(true);
			  } catch (error) {
				console.error('Error fetching user data:', error);
			  } finally {
				setIsLoading(false);
			  }
			};

			fetchUserData();
		  } else {
			setIsLoading(false);
		  }
	  }, [setUser, authToken]);

	  console.log("!!!!authToken: ", authToken);
	  console.log("!!!!USER ", user);

	//   useEffect(() => {
		// Example function to refresh the token
	// 	const refreshAuthToken = async () => {
	// 	  try {
	// 		const response = await axios.get('/api/refresh', {
	// 		  // Include necessary details for refreshing the token
	// 		});
	// 		setAuthToken(response.data.newToken);
	// 	  } catch (error) {
	// 		console.error('Error refreshing token:', error);
	// 		setIsLogged(false); // Consider logging the user out or redirecting to login
	// 	  }
	// 	};

	// 	const checkTokenValidity = () => {
	// 	  if (authToken) {
	// 		// Implement logic to check if the token is nearing expiration
	// 		// This could be based on decoding the JWT or a stored expiration time
	// 		const isTokenExpiring = false; // Placeholder condition
	// 		if (isTokenExpiring) {
	// 		  refreshAuthToken();
	// 		}
	// 	  }
	// 	};

	// 	checkTokenValidity();
	// 	// You might want to run this check more frequently, using setInterval or similar
	//   }, [authToken]);

  return (
    <AuthContext.Provider value={{
		authToken,
		setAuthToken,
		isLoading,
		setIsLoading,
		user,
		setUser,
		isLogged,
		setIsLogged,
	  }}>
		{children}
	  </AuthContext.Provider>
  );
};

export default AuthContext;

/*
			const urlParams = new URLSearchParams(window.location.search);
			const token = urlParams.get('access_token');
			if (token) {
			  setAuthToken(token);
			}
			*/
