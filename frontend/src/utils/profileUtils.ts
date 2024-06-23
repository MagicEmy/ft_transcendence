import { UserStatus } from '../types/shared';
import { Games } from '../types/shared';
import { USER, GAMES, STATUS, AVATAR } from './constants';

export const loadGames = async (userId: string): Promise<Games[]> => {
	if (!userId) return [];

	try {
	  const response = await fetch(`${GAMES}/${userId}`, {
		method: 'GET',
		headers: {
		  'Content-Type': 'application/json'
		},
		credentials: 'include'
	  });

	  if (!response.ok) {
		throw new Error(`Error loading friends: ${response.statusText}`);
	  }

	  const games: Games[] = await response.json();
	  return games;
	} catch (error) {
	  console.error('Error loading friends:', error);
	  return [];
	}
  };


  export const loadStatus = async (userId: string): Promise<UserStatus> => {
	const response = await fetch(`${STATUS}/${userId}`, {
	  method: 'GET',
	  headers: {
		'Content-Type': 'application/json'
	  },
	  credentials: 'include'
	});
	if (!response.ok) {
	  throw new Error('Failed to fetch status');
	}
	const fetchedUserStatus: UserStatus = await response.json();
	return fetchedUserStatus;
  };

  export const loadProfileAvatar = async (userId: string): Promise<string> => {
	try {
	  const response = await fetch(`${AVATAR}/${userId}`, {
		method: 'GET',
		credentials: 'include'
	  });

	  if (!response.ok) {
		throw new Error(`Error: ${response.status}`);
	  }
	  const blob = await response.blob();
		const stringImageUrl = await new Promise((resolve, reject) => {
			let fr = new FileReader();
			fr.onload = () => {
				resolve(fr.result )
			};
			fr.onerror = reject;
			fr.readAsDataURL(blob);
		});

	  return stringImageUrl as string;
	} catch (error) {
	  console.error('Failed to fetch avatar:', error);
	  return '';
	}
  };

  export const changeName = async (userId: string, newUserName: string): Promise<any> => {
	const response = await fetch(`${USER}/${userId}/${newUserName}`, {
	  method: 'PATCH',
	  headers: { 'Content-Type': 'application/json' },
	  credentials: 'include',
	  body: JSON.stringify({ newUserName })
	});
	if (!response.ok) {
	  throw new Error('Failed to change name');
	}
	const newNameProfile = await response.json();
	return newNameProfile;
  };
