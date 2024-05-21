import React, { useContext, useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import classes from './Navbar.module.css';
import LogoutButton from './LogoutButton';
import useStorage from '../hooks/useStorage';
import  UserContext  from '../context/UserContext';
import { loadProfileAvatar } from '../utils/profileUtils';

interface UserDataStorage {
  userId?: string ;
  userName?: string;
  [key: string]: any;
}

const Navbar = (): JSX.Element => {
  // const { userProfile } = useContext(UserContext);
  // const { userIdContext } = useContext(UserContext);
  const [userProfile] = useStorage<UserDataStorage>("user", {});
  const [avatar, setAvatar] = useStorage<string>('avatar', '');

  const { userData, userIdContext, isLoading } = useContext(UserContext);

  useEffect(() => {
    const fetchAvatar = async () => {
      if (userProfile.userId) {
        try {
          const imageUrl = await loadProfileAvatar(userProfile.userId);
		  if (imageUrl)
	        setAvatar(imageUrl);
        } catch (error: any) {
          console.error('Error fetching avatar:', error.message);
        }
      }
    };
    fetchAvatar();
  }, [userProfile.userId, setAvatar]);
  return (
    <header className={classes.header}>
      <div className={classes.avatar}>
        <span>{userProfile?.userName}</span>
        <NavLink
          to="/profile"
          className={({ isActive }) => (isActive ? classes.active : undefined)}
        >
          <div className={classes.avatarImage}>
            {avatar ? (
              <img className={classes.avatarImage} src={avatar} alt="User Avatar" />
            ) : (
              <p>Loading...</p>
            )}
          </div>
        </NavLink>
      </div>
      <nav>
        <ul className={classes.list}>
          <li>
            <NavLink
              to="/dashboard"
              className={({ isActive }) => (isActive ? classes.active : undefined)}
              end
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/profile"
              className={({ isActive }) => (isActive ? classes.active : undefined)}
            >
              Profile
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/leaderboard"
              className={({ isActive }) => (isActive ? classes.active : undefined)}
            >
              Leaderboard
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/game"
              className={({ isActive }) => (isActive ? classes.active : undefined)}
            >
              Game
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/chat"
              className={({ isActive }) => (isActive ? classes.active : undefined)}
            >
              Chat
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/settings"
              className={({ isActive }) => (isActive ? classes.active : undefined)}
            >
              Settings
            </NavLink>
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
