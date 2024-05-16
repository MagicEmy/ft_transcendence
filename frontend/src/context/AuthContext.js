import React, { createContext, useState, useEffect } from 'react';
import useStorage from '../hooks/useStorage';
import Cookies from 'js-cookie';

const AuthContext = createContext({
	authToken: null,
	isLogged: false,
	setIsLogged: () => { },
});
// /localStorage.setItem('token', token);
export const AuthProvider = ({ children }) => {
	const [authToken, setAuthToken] = useStorage('authToken', '');
	const [isLogged, setIsLogged] = useState(false);

	const authTokenFromCookie = Cookies.get('Authentication');

	useEffect(() => {
		if (authTokenFromCookie) {
			setIsLogged(true);
			setAuthToken(authTokenFromCookie);
		} else {
			setIsLogged(false);
		}
	}, [authTokenFromCookie]);

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
			isLogged,
			setIsLogged,
		}}>
			{children}
		</AuthContext.Provider>
	);
};

export default AuthContext;
