import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import UserContext, { IUserContext } from '../context/UserContext';

interface LogoutButtonProps {
  className?: string;
}
const LogoutButton = ({ className }: LogoutButtonProps) => {
  const { userIdContext, setUserIdContext, setUserNameContext } = useContext<IUserContext>(UserContext);

  const navigate = useNavigate();

  async function userLogout() {
    try {
      console.log('Logging out user:', userIdContext);
      const response = await fetch('http://localhost:3003/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ userId: userIdContext })
      });

      if (!response.ok) {
        throw new Error('Failed to log out');
      }

      console.log('User logged out');
      setUserIdContext('');
      setUserNameContext('');
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
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
