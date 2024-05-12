import React, { createContext, useState, useEffect, useContext } from 'react';
import AuthContext from './AuthContext'
import axios from 'axios';
import useStorage from '../hooks/useStorage';

const UserContext = createContext({
	userProfile: {},
	isLoading: true
});

export const UserProvider = ({ children }) => {
	const { authToken } = useContext(AuthContext);
	const [userProfile, setUserProfile] = useStorage('user', {});
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (authToken) {
			setIsLoading(true);
			const fetchUser = async () => {
				try {
					const response = await axios.get('http://localhost:3003/auth/profile', {
						headers: {
							Authorization: `Bearer ${authToken}`,
						},
						withCredentials: true,
					});
					if (response.status === 200) {
						setUserProfile(response.data);
						console.log('userContext', response.data);
					} else {
						console.error('Failed to fetch profile data:', response);
					}
				} catch (error) {
					console.error('Error fetching user data:', error);
				} finally {
					setIsLoading(false);
				}
			};
			fetchUser();
		} else {
			setIsLoading(false);
			console.log('No authToken !userProfile?.id');
		}
	}, [authToken]);

	return (
		<UserContext.Provider value={{
			userProfile,
			isLoading
		}}>
			{children}
		</UserContext.Provider>
	);
};

export default UserContext;
