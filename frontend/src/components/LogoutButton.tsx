import React from 'react';
import { useNavigate } from 'react-router-dom';
import useStorage from '../hooks/useStorage';
import { extractUserIdFromToken, TokenUserDetails } from '../utils/tokenUtils';

interface LogoutButtonProps {
  className?: string;
}

const LogoutButton = ({ className }: LogoutButtonProps) => {
  const [authToken, , removeToken] = useStorage<string | null>('authToken', null);
  const [ , , removeUser] = useStorage<{ userId: string } | null>('user', null);
  const [, , removeUserDetails] = useStorage<TokenUserDetails | null>('userDetails', null);

  const [, , removeAvatar] = useStorage<string>('avatar', '');
  const navigate = useNavigate();

  async function userLogout() {
    try {
      if (authToken) {
        const userId = extractUserIdFromToken(authToken);
        console.log('Logging out user:', userId);
        console.log('Logging out authToken:', authToken);

        const response = await fetch('http://localhost:3003/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify({ user_id: userId }),
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to logout');
        }

        console.log('User logged out');
        removeToken();
        removeUser();
		removeUserDetails();
        removeAvatar();
        navigate('/');
      }
    } catch (error) {
      console.log('Error logging out:', error);
      removeToken();
	  removeUserDetails();
      removeUser();
      removeAvatar();
      navigate('/');
    }
  }

  return (
    <button className={className} onClick={userLogout}>
      Logout
    </button>
  );
};

export default LogoutButton;
