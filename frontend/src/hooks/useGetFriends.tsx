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
  const [error, setError] = useState<string | null>(null);

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
        setError(err.message || 'Failed to load friends');
        console.log('Error handled in useEffect:', err.message);
      }
    }
  };

  useEffect(() => {
    if (userId) {
      getFriends(userId);

      const intervalId = setInterval(() => {
        getFriends(userId);
      }, pollingInterval);

      //clear the interval when the component unmounts
      return () => clearInterval(intervalId);
    }
  }, [userId, userIdorMe, pollingInterval]);

  return { friends, loading, error };
};
