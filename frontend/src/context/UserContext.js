import React, { createContext, useState, useEffect, useContext } from 'react';
import AuthContext from './AuthContext'
import axios from 'axios';
import useStorage from '../hooks/useStorage';

const UserContext = createContext({
    userProfile: {},
    isLoading: true
});

export const UserProvider = ({ children }) => {
    const {authToken} = useContext(AuthContext);
    const [userProfile, setUserProfile] = useStorage('user', {});
	console.log('userProfile', userProfile)
    const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
	    if (authToken) {
			const fetchUser = async () => {
			  try {
				const response = await axios.get('http://localhost:3003/auth/profile', {
				  headers: {
					Authorization: `Bearer ${authToken}`,
				  },
				  withCredentials: true,
				});
				const data = response.data;
                setUserProfile(data)
				console.log("HERE User provider: ", data);
			  } catch (error) {
				console.error('Error fetching user data:', error);
			  } finally {
				setIsLoading(false);
				console.error('finally');
			  }
			};
			fetchUser();
		  } else {
			setIsLoading(false);
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
