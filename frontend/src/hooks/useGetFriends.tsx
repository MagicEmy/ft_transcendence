import { useEffect, useState } from "react";
import { Friends } from "../types/shared";
import { loadFriends } from "../utils/friendsUtils";


export const useGetFriends = (userId: string, userIdorMe: string) => {
  const [friends, setFriends] = useState<Array<Friends> | null>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const getFriends = async (userId: string) => {
      setLoading(true);
      const listFriends = await loadFriends(userId);
      setLoading(false);
      listFriends && setFriends(listFriends);
    }
    userId && getFriends(userId);
  }, [userId, userIdorMe]);

  return {
    friends,
    loading
  }
}
