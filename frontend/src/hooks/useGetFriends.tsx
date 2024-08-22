import { useEffect, useState } from 'react';
import { Friends } from '../types/shared';
import { loadFriends } from '../utils/friendsUtils';

export const useGetFriends = (
  userId: string,
  userIdorMe: string,
  pollingInterval = 5000,
) => {
  const [friends, setFriends] = useState<Array<Friends> | null>(null);
  const [loading, setLoading] = useState(false);
	const [error, setError] = useState<number | null>(null);

  const getFriends = async (userId: string, retry = 2) => {
    try {
      setLoading(true);
      const listFriends = await loadFriends(userId);
			setLoading(false);
			listFriends && setFriends(listFriends);
    } catch (err: any) {
      if (retry > 0 && err.message.includes('Unauthorized')) {
        return getFriends(userId, retry - 1);
      } else {
				setLoading(false);
        const errorStatus = err instanceof Error ? parseInt(err.message) : 500;
        setError(errorStatus);
        console.log('Error handled in useEffect:', err.message);
      }
    }
  };

  useEffect(() => {
    if (userId) {
      getFriends(userId);
    }
  }, [userId, userIdorMe]);

  useEffect(() => {
    if (friends && friends.length > 0) {
      const intervalId = setInterval(() => {
        getFriends(userId);
      }, pollingInterval);

      // clearing the interval when the component unmounts or when the condition changes
      return () => clearInterval(intervalId);
    }
  }, [friends, userId, pollingInterval]);

  return { friends, loading, error };
};
