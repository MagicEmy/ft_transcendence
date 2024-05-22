import { UserProfile } from '../types/shared';
  
export const loadProfile = async (userId: string): Promise<any> => {
	const response = await fetch(`http://localhost:3002/profile/${userId}`, {
	  headers: { 'Content-Type': 'application/json' },
	  credentials: 'include'
	});
	if (!response.ok) {
	  throw new Error('Failed to fetch profile');
	}
	const profile = await response.json();
	return profile;
  };
  export const loadStatus = async (userId: string): Promise<any> => {
	const response = await fetch(`http://localhost:3002/user/${userId}/status`, {
	  method: 'GET',
	  headers: {
		'Content-Type': 'application/json'
	  },
	  credentials: 'include'
	});
	if (!response.ok) {
	  throw new Error('Failed to fetch status');
	}
	const userStatus = await response.json();
	return userStatus;
  };

  export const loadProfileAvatar = async (userId: string): Promise<string> => {
	try {
	  const response = await fetch(`http://localhost:3002/user/${userId}/avatar`, {
		headers: {
		  'Accept': 'application/json'
		},
		credentials: 'include'
	  });
	  if (!response.ok) {
		throw new Error('Failed to fetch avatar');
	  }
	  const blob = await response.blob();
	  const imageUrl = URL.createObjectURL(blob);
	  return imageUrl;
	} catch (error) {
	  console.error('Failed to fetch avatar:', error);
	  return '';
	}
  };

  export const changeName = async (userId: string, newUserName: string): Promise<any> => {
	const response = await fetch(`http://localhost:3002/profile/${userId}/${newUserName}`, {
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
  