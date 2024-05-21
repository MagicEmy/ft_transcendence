import React, { createContext, useState, useEffect, ReactNode } from "react";
import useStorage from "../hooks/useStorage";

// Define User interface
interface User {
  userId?: string;
  userName?: string;
}

// Define UserContextType interface
interface UserContextType {
  userData: User;
  userIdContext: string;
  isLoading: boolean;
}
interface UserDataStorage {
  userId?: string;
  userName?: string;
  [key: string]: any;
}

// Initial context value
const initialContext: UserContextType = {
  userData: {},
  userIdContext: "",
  isLoading: false,
};

// Create the context with the defined type
const UserContext = createContext<UserContextType>(initialContext);

// Define the props type for the UserProvider component
interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps): JSX.Element => {
  const [userProfileStore, setUserProfileStore] = useStorage<UserDataStorage>(
    "user",
    {}
  );
  const [userData, setUserData] = useState<User>(userProfileStore || {});
  const [userIdContext, setUserIdContext] = useState<string>(
    userProfileStore.userId || ""
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (userData) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch("http://localhost:3003/auth/profile", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });
		
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const profile = await response.json();
		setUserData(profile.value);
		setUserIdContext(profile.value.user_id);
		setUserProfileStore(profile.value);
		console.log("profile.value in context", profile.value);
		console.log("profile.data in context", profile.data);
		console.log("profile in context", profile);

		// if (profile.value !== null) {
		// 	setUserData(profile.value);
		// 	setUserIdContext(profile.value.user_id);
		// 	setUserProfileStore(profile.value);
		// 	console.log("profile.data in context", profile.value);
		// }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [userData]);

  useEffect(() => {
	console.log("User Data in context", userData);
	console.log("User ID Context in context", userIdContext);

  }, [userData, userIdContext, isLoading]);

  return (
    <UserContext.Provider
      value={{
        userData,
        userIdContext,
        isLoading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
