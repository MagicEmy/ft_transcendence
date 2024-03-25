import React from 'react';

const AuthContext = React.createContext({
  isLoggedIn: false,
  user: null,
  token: null,
});

export default AuthContext;