interface UserProfile {
	user_id: string;
	user_name: string;
  }
  
  export const loadProfile = async (userId: string): Promise<UserProfile> => {
	const response = await fetch(`http://localhost:3002/profile/${userId}`, {
	  method: 'GET',
	  credentials: 'include', // to include cookies
	});
	
	if (!response.ok) {
	  throw new Error('Failed to fetch profile');
	}
  
	const profile: UserProfile = await response.json();
	return profile;
  };
  
  export const loadProfileAvatar = async (userId: string): Promise<string | undefined> => {
	if (!userId) return;
  
	const response = await fetch(`http://localhost:3002/user/${userId}/avatar`, {
	  method: 'GET',
	  credentials: 'include', // to include cookies
	});
  
	if (!response.ok) {
	  throw new Error('Failed to fetch avatar');
	}
  
	const blob = await response.blob();
	const imageUrl = URL.createObjectURL(blob);
	return imageUrl;
  };
  
  export const changeName = async (userId: string, newUserName: string): Promise<UserProfile> => {
	const response = await fetch(`http://localhost:3002/profile/${userId}/username`, {
	  method: 'PATCH',
	  credentials: 'include', 
	});
	
	if (!response.ok) {
	  throw new Error('Failed to change name');
	}
  
	const newNameProfile: UserProfile = await response.json();
	return newNameProfile;
  };

  export const loadStatus = async (userId: string,) => {
	const response = await fetch(`http://localhost:3002/profile/${userId}/status`, {
	  method: 'GET',
	  credentials: 'include',
  });
  
  if (!response.ok) {
	throw new Error('Failed to fetch status');
  }
  const status: string = await response.json();
  return status;
  };