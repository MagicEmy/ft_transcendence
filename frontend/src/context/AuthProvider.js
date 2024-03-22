import { createContext, useState, } from "react";

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState({});
//   const [isLogged, setIsLogged] = useState(false);

  // const contextValue = {
	  //   auth,
	  //   setAuth,
	  //   isLogged,
	  //   setIsLogged,
	    // };


  return (
    // <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
