import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import classes from './Navbar.module.css';
import LogoutButton from '../LogoutButton';
import UserContext, { IUserContext } from '../../context/UserContext';
import { loadProfileAvatar } from '../../utils/profileUtils';
import { NavigationButton } from './NavigationButton';
import { Avatar } from '../Avatar'

export const Navbar = () => {
  const { userIdContext, userNameContext, setAvatarContext } = useContext<IUserContext>(UserContext);
  const navigate = useNavigate();

  return (
    <header className={classes.header}>
      <div className={classes.avatar}>
        <div className={classes.avatarImage} onClick={() => navigate('/profile')}>
          <Avatar  />
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

//window.location  in console!!
