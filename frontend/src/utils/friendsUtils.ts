import { Friends } from '../types/shared';
import { FRIENDS, ADD_FRIEND, DEL_FRIEND } from '../utils/constants';


export const loadFriends = async (userId: string): Promise<Friends[] | undefined> => {
  if (!userId) return;

  try {
    const response = await fetch(`${FRIENDS}/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });
    if (!response.ok) {
		// console.log('IN LOADFRIENDS response not ok', response.status);
      throw new Error(`Error loading friends: ${response.statusText}`);
    }
    const friends: Friends[] = await response.json();
    return friends;
  } catch (error) {
    // console.error('Error loading friends json:', error);
	throw error;
  }
};

export const addFriend = async (userId: string, friendId: string): Promise<void> => {
  if (!userId || !friendId) {
    console.error('Missing userId or friendId');
    return;
  }

  try {
    const addFriendBody = {
      userId: userId,
      friendId: friendId,
    };
    const body = JSON.stringify(addFriendBody);
    const response = await fetch( ADD_FRIEND, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: body,
    });

    if (!response.ok) {
      throw new Error(`Error adding friend: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error adding friend:', error);
  }
};

export const deleteFriend = async (userId: string, friendId: string): Promise<void> => {
  if (!userId || !friendId) {
    console.error('Missing userId or friendId');
    return;
  }

  try {
    const delFriendBody = {
      userId: userId,
      friendId: friendId,
    };
    const body = JSON.stringify(delFriendBody);
    const response = await fetch( DEL_FRIEND, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: body,
    });

    if (!response.ok) {
      throw new Error(`Error deleting friend: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting friend:', error);
  }
};
