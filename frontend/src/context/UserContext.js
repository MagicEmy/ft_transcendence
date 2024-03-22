
import React, { createContext, useState } from 'react';

// Create context
export const UserContext = createContext();

// Create provider component
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};


// import React, { createContext, useReducer } from "react";

// export const UserContext = createContext();

// export const userReducer = ( state, action ) => {
//   switch (action.type) {
//     case "LOGIN":
//       return { ...state, user: action.payload };
//     case "LOGOUT":
//       return { ...state, user: null };
//     default:
//       return state;
//   }
// }

// export const UserProvider = ({ children }) => {
// 	  const [state, dispatch] = useReducer(userReducer, { user: null });

//   return (
// 	<UserContext.Provider value={{ ...state, dispatch }}>
// 	  {children}
// 	</UserContext.Provider>
//   );
// }

// export default UserContext;