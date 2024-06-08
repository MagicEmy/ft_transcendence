import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import classes from './Navbar.module.css';
import LogoutButton from './LogoutButton';
import UserContext, { IUserContext } from '../context/UserContext';
import useStorage from "../hooks/useStorage";
import { loadProfileAvatar } from '../utils/profileUtils';
import { NavigationButton } from './NavigationButton';

export const Navbar = () => {
  const { userNameContext, avatarContext, setAvatarContext } = useContext<IUserContext>(UserContext);
  const [userIdStorage, ,] = useStorage<string>('userId', '');
  const navigate = useNavigate();

  useEffect(() => {
    let active = true; // Flag to manage the effect lifecycle

    const cleanupPreviousAvatar = () => {
      if (avatarContext) {
        URL.revokeObjectURL(avatarContext);
      }
    };

    const fetchAvatar = async () => {
      if (userIdStorage) {
        try {
          const url = await loadProfileAvatar(userIdStorage);
          if (active) {
            cleanupPreviousAvatar();
            setAvatarContext(url || null);
          }
        } catch (error) {
          console.error('Error loading avatar:', error);
        }
      }
    };

    fetchAvatar();

    return () => {
      cleanupPreviousAvatar();
      active = false;
    };
  }, []);

  return (
    <header className={classes.header}>
      <div className={classes.avatar}>
        <div className={classes.avatarImage} onClick={() => navigate('/profile')}>
          {avatarContext ? <img className={classes.avatarImage} src={avatarContext} alt="User Avatar" /> : <p>Loading...</p>}
        </div>
        <span className={classes.name}>{userNameContext}</span>
      </div>
      <nav>
        <ul className={classes.list}>
          <li>
            <NavigationButton to="/dashboard" className="button">Dashboard</NavigationButton>
          </li>
          <li>
            <NavigationButton to="/profile" className="button">Profile</NavigationButton>
          </li>
          <li>
            <NavigationButton to="/leaderboard" className="button">Leaderboard</NavigationButton>
          </li>
          <li>
            <NavigationButton to="/game" className="button">Game</NavigationButton>
          </li>
          <li>
            <NavigationButton to="/chat" className="button">Chat</NavigationButton>
          </li>
          <li>
            <NavigationButton to="/settings" className="button">Settings</NavigationButton>
          </li>
        </ul>
      </nav>
      <div className={classes.buttons}>
        <LogoutButton className={classes.logoutButton} />
      </div>
    </header>
  );
}

export default Navbar;
