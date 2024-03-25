import React, { createContext, useState } from 'react';

// Define the shape of the user data and the setUser function
const defaultUserData = {
  	user: {
    userName: '',
    intraId: '',
    avatar: '',
    status: '',
    isLogged: false,
    TwoFactorAuth: false,
    score: 1,
    intraName: ''
  },
  setUser: () => {} // Placeholder function
};

// Create the context with the default value
export const UserContext = createContext(defaultUserData);

// Create provider component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(defaultUserData.user);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;