import { useState, useEffect } from 'react';
import { USER } from '../utils/constants';

export const useIsLoggedIn = () => {
  const [isLoggedin, setIsLoggedin] = useState<boolean>();
  const [, setError] = useState<string>();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(USER, {
          method: "GET",
          credentials: "include",
        });
        if (!response.ok) {
			setError(`Error: ${response.status}`);
			return;
		  }
        const profile = await response.json();
        if (profile.userId) setIsLoggedin(true);
      } catch (error) {
        console.error("Error fetching user data: error caught: ", error);
      }
    };
	fetchUser();
  }, []);

  return { isLoggedin };

};
