import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import classes from './Navbar.module.css';
import LogoutButton from '../LogoutButton';
import UserContext, { IUserContext } from '../../context/UserContext';
import { NavigationButton } from './NavigationButton';
import useStorage from '../../hooks/useStorage';
import { Avatar } from '../Avatar';

export const Navbar = () => {
  const { userNameContext, setUserNameContext } = useContext<IUserContext>(UserContext);
  const [userNameStorage] = useStorage<string>('userName', '');
  const navigate = useNavigate();
  
	useEffect(() => {
    const updateContextFromStorage = () => {
      console.log('NAV userNameStorage:', userNameStorage);
      if (userNameStorage && userNameStorage !== userNameContext) {
        setUserNameContext(userNameStorage);
      }
    };

    updateContextFromStorage();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userName') {
        updateContextFromStorage();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [userNameStorage, userNameContext, setUserNameContext]);

	
  return (
    <header className={classes.header}>
      <div className={classes.avatar}>
        <div
          className={classes.avatarImage}
          onClick={() => navigate('/profile')}
        >
          <Avatar />
        </div>
        <span className={classes.name}>{userNameContext}</span>
      </div>
      <nav>
        <ul className={classes.list}>
          <li>
            <NavigationButton to="/dashboard" className="button">
              Dashboard
            </NavigationButton>
          </li>
          <li>
            <NavigationButton to="/profile" className="button">
              Profile
            </NavigationButton>
          </li>
          <li>
            <NavigationButton to="/leaderboard" className="button">
              Leaderboard
            </NavigationButton>
          </li>
          <li>
            <NavigationButton to="/game" className="button">
              Game
            </NavigationButton>
          </li>
          <li>
            <NavigationButton to="/chat" className="button">
              Chat
            </NavigationButton>
          </li>
          <li>
            <NavigationButton to="/settings" className="button">
              Settings
            </NavigationButton>
          </li>
        </ul>
      </nav>
      <div className={classes.logout}>
        <span className={classes.quote}>“Don’t Panic”</span>
        <div className={classes.buttons}>
          <LogoutButton className={classes.logoutButton} />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
