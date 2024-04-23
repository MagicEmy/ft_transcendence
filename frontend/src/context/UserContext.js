import React, { createContext, useState, useEffect, useContext } from 'react';
import AuthContext from './AuthContext'
import axios from 'axios';

const UserContext = createContext({
    userProfile: {},
    isLoading: true
});

export const UserProvider = ({ children }) => {
    const {userId, authToken} = useContext(AuthContext);
    const [userProfile, setUserProfile] = useState({})
    const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
        console.log(authToken, 'authToken')
	    if (authToken) {
			console.log("%%%authToken: ", authToken);
			const fetchUser = async () => {
			  try {
				const response = await axios.get('http://localhost:3003/auth/profile', {
				  headers: { Authorization: `Bearer ${authToken}` },
				});
				const data = response.data;
                setUserProfile(data)
				console.log("HERE User provider: ", data);
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
	  }, [authToken, userId]);


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
