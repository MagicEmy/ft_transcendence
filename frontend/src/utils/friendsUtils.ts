import { Friends } from '../types/shared';
import { BASE_URL } from '../utils/constants';


export const loadFriends = async (userId: string): Promise<Friends[] | undefined> => {
  if (!userId) return;

  try {
    const response = await fetch(`${BASE_URL}/friends/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });
    if (!response.ok) {
      throw new Error(`Error loading friends: ${response.statusText}`);
    }

    const friends: Friends[] = await response.json();
    return friends;
  } catch (error) {
    console.error('Error loading friends json:', error);
  }
};

export const addFriend = async (userId: string, friendId: string): Promise<void> => {
  if (!userId || !friendId) {
    console.error('Missing userId or friendId');
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/friend`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userId,
        friendId: friendId,
      }),
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
    const response = await fetch(`${BASE_URL}/friend`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userId,
        friendId: friendId,
      }),
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
