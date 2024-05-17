import React, { createContext, useState, useEffect, useContext } from 'react';
import AuthContext from './AuthContext'
import { loadProfileAvatar } from '../libs/profileData';
import axios from 'axios';
import useStorage from '../hooks/useStorage';

const UserContext = createContext({
	userProfile: {},
	avatar: '',
	isLoading: true
});

export const UserProvider = ({ children }) => {
	const { authToken } = useContext(AuthContext);
	const [userProfile, setUserProfile, ] = useStorage('user', {});
	const [avatar,setAvatar] = useStorage('avatar', '');
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		if (!authToken) {
			console.log('No authToken available.');
			setIsLoading(false);
			return;
		}
		setIsLoading(true);
		console.log(`Authorization header: Bearer ${authToken}`);
		const fetchUser = async () => {
			try {
				const response = await axios.get('http://localhost:3003/auth/profile', {
					headers: {
						Authorization: `Bearer ${authToken}`,
					},
					withCredentials: true,
				});
				if (response.status < 300 ) {
					setUserProfile(response.data);
					console.log('response.data ok but..', response.data);
				} else {
					console.error('response.data ok but not ok:', response.status);
				}
			} catch (error) {
				console.error('Error fetching user data: error caught: ', error);
			} finally {
				setIsLoading(false);
			}
		};
		fetchUser();
	}, [authToken, setUserProfile]);


	useEffect(() => {
	  const fetchUserData = async () => {
		if (userProfile?.user_id) {
		  try {
			const imageUrl = await loadProfileAvatar(userProfile.user_id);
			setAvatar(imageUrl);
		  } catch (error) {
			console.error('Error fetching user data:', error);
		  }
		}
	  };

	  fetchUserData();
	}, [userProfile, setAvatar]);

return (
	<UserContext.Provider value={{
		userProfile,
		avatar,
		isLoading
	}}>
		{children}
	</UserContext.Provider>
);
};

export default UserContext;
