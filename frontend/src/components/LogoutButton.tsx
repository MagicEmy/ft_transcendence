import React from "react";
import { useNavigate } from "react-router-dom";
import useStorage from "../hooks/useStorage";

interface LogoutButtonProps {
  className?: string;
}

const LogoutButton = ({ className }: LogoutButtonProps) => {
  const [userId, , removeUserId] = useStorage('userId', '');
  const [userName, , removeUserName] = useStorage('userName', '');
  const [avatar, , removeAvatar] = useStorage("avatar", '');
  const navigate = useNavigate();

  async function userLogout() {
    try {
      console.log('Logging out user:', userId);
      const response = await fetch('http://localhost:3003/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ user_id: userId })
      });

      if (!response.ok) {
        throw new Error('Failed to log out');
      }

      console.log('User logged out');
      removeUserId();
      removeUserName();
      removeAvatar();
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
      removeUserId();
      removeUserName();
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
