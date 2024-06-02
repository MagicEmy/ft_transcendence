import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import UserContext, { IUserContext } from '../context/UserContext';
import useStorage from '../hooks/useStorage';


interface LogoutButtonProps {
  className?: string;
}
const LogoutButton = ({ className }: LogoutButtonProps) => {
  const { setUserIdContext } = useContext<IUserContext>(UserContext);
  const [userIdStorage, , removeUserIdStorage] = useStorage('userId', '');
  const navigate = useNavigate();

  async function userLogout() {
    try {
      console.log('Logging out user:', userIdStorage);
      const response = await fetch('http://localhost:3001/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          userId: userIdStorage
        })
      });
      if (response.ok) {
        console.log('User logged out');
        setUserIdContext('');
        removeUserIdStorage();
        navigate('/');
      } else {
        throw new Error('Failed to log out');
      }
    } catch (error) {
      console.log('Error logging out:', error);
      setUserIdContext('');
      removeUserIdStorage();
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
