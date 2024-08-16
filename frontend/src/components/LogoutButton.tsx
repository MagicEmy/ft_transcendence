import { useNavigate } from 'react-router-dom';
import useStorage from '../hooks/useStorage';
import { LOGOUT } from '../utils/constants';

interface LogoutButtonProps {
  className?: string;
}

const LogoutButton = ({ className }: LogoutButtonProps) => {
  const [, , removeUserIdStorage] = useStorage('userId', '');
  const [, , removeUserNameStorage] = useStorage<string>('userName', '');
  const navigate = useNavigate();

  async function userLogout() {
    try {
      const response = await fetch(LOGOUT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      if (response.ok) {
        console.log('User logged out');
        removeUserIdStorage();
        removeUserNameStorage();
        navigate('/', { replace: true });
      } else {
        throw new Error('Failed to log out');
      }
    } catch (error) {
      console.log('Error logging out:', error);
      removeUserIdStorage();
      removeUserNameStorage();
      navigate('/', { replace: true });
    }
  }

  return (
    <button className={className} onClick={userLogout}>
      Logout
    </button>
  );
};

export default LogoutButton;
