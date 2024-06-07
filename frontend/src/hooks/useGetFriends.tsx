import React, { useEffect, useState } from "react";
import { Friends } from "../types/shared";
import { loadFriends } from "../utils/friendsUtils";

export const useGetFriends = (userId?: string) => {
	const [friends, setFriends] = useState<Array<Friends> | null>();

	useEffect(() => {
		const getFriends = async (uId: string) => {
			const listFriends = await loadFriends(uId);
			listFriends && setFriends(listFriends);
		}
		userId && getFriends(userId);
	}, []);

	return {
		friends
	}
}
