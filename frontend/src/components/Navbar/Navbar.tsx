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
    const checkStorageAndUpdateContext = () => {
			const storedName = localStorage.getItem('userName');
			console.log('NAV storedName:', storedName);
      if (storedName && storedName !== userNameContext) {
        setUserNameContext(storedName);
      }
    };
    checkStorageAndUpdateContext();

    window.addEventListener('storage', checkStorageAndUpdateContext);
    return () => {
      window.removeEventListener('storage', checkStorageAndUpdateContext);
    };
  }, [userNameContext, userNameStorage, setUserNameContext]);
	
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
