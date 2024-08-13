import { useState, useEffect } from "react";
import { UserProfile } from "../types/shared";
import { USER } from "../utils/constants";

export const useGetProfile = (userId: string) => {
  const [profile, setProfile] = useState<UserProfile>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>();

  useEffect(() => {
    const fetchDbProfile = async (retry = 2) => {
      setIsLoading(true);
      const response = await fetch(`${USER}/${userId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      setIsLoading(false);
      if (!response.ok) {
        if (response.status === 401 && retry > 0) {
          return fetchDbProfile(retry - 1);
        } else {
          setError(`Error: ${response.status}`);
          return;
        }
      }
      const profileData: UserProfile = await response.json();
      setProfile(profileData);
    };

    fetchDbProfile();
  }, [userId]);

  return { profile, error, isLoading };
};
