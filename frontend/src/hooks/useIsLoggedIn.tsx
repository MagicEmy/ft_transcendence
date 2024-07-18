import { useState, useEffect } from 'react';
import { JWT_CHECK } from '../utils/constants';

export const useIsLoggedIn = () => {
  const [isLoggedin, setIsLoggedin] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(JWT_CHECK, {
          method: "GET",
          credentials: "include",
        });
        if (!response.ok) {
          setError(`Error: ${response.status}`);
          setIsLoggedin(false);
          setLoading(false);
          return;
        }
        const isJwtValid = await response.json();
        setIsLoggedin(isJwtValid);
      } catch (error) {
        console.error("Error fetching Jwt-check: ", error);
        setError("Error fetching Jwt-check");
        setIsLoggedin(false);
      } finally {
        setLoading(false); 
      }
    };
    fetchUser();
  }, []);

  return { isLoggedin, loading, error };
};
