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
	const [userId, setUserId] = useState(null);
	const [isLogged, setIsLogged] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {

	    if (authToken) {
			console.log("%%%authToken: ", authToken);
			const fetchUser = async () => {
			  try {
				const response = await axios.get('http://localhost:3003/auth/profile', {
				  headers: { Authorization: `Bearer ${authToken}` },
				});
				const data = response.data;
				setUser(data.user_name);
				setUserId(data.user_id);
				console.log("HERE USER: ", data.user_id);
				setIsLogged(true);
			  } catch (error) {
				console.error('Error fetching user data:', error);
			  } finally {
				setIsLoading(false);
			  }
			};

			fetchUser();
		  } else {
			setIsLoading(false);
		  }
	  }, [setUser, authToken]);

	  console.log("!!!!USER ", userId);

	//   useEffect(() => {
	// 	const refreshAuthToken = async () => {
	// 	  try {
	// 		const response = await axios.get('/api/refresh', {
	// 		});
	// 		setAuthToken(response.data.newToken);
	// 	  } catch (error) {
	// 		console.error('Error refreshing token:', error);
	// 		setIsLogged(false); // Consider logging the user out or redirecting to login
	// 	  }
	// 	};

	// 	const checkTokenValidity = () => {
	// 	  if (authToken) {
	// 		// This could be based on decoding the JWT or a stored expiration time
	// 		const isTokenExpiring = false;
	// 		if (isTokenExpiring) {
	// 		  refreshAuthToken();
	// 		}
	// 	  }
	// 	};

	// 	checkTokenValidity();
	// 	// maybe using setInterval or similar?
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
