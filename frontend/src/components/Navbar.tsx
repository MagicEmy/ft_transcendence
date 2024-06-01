import React, { useContext, useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import classes from './Navbar.module.css';
import LogoutButton from './LogoutButton';
import UserContext, { IUserContext } from '../context/UserContext';
import { loadProfileAvatar } from '../utils/profileUtils';

  export const Navbar = () => {
  const {
    userIdContext,
    userNameContext,
    avatarContext,
    setAvatarContext,
  } = useContext<IUserContext>(UserContext);

  useEffect(() => {
    let active = true; // Flag to manage the effect lifecycle

    const cleanupPreviousAvatar = () => {
      if (avatarContext) {
        URL.revokeObjectURL(avatarContext);
      }
    };

    const fetchAvatar = async () => {
      if (userIdContext) {
        try {
          const url = await loadProfileAvatar(userIdContext);
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
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            isActive ? classes.active : undefined
          }
        >
          <div className={classes.avatarImage}>
            {avatarContext ? <img className={classes.avatarImage} src={avatarContext} alt="User Avatar" /> : <p>Loading...</p>}
          </div>
        </NavLink>
        <span className={classes.name}>{userNameContext}</span>
      </div>
      <nav>
        <ul className={classes.list}>
          <li>
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                isActive ? classes.active : undefined
              }
              end
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/profile"
              className={({ isActive }) =>
                isActive ? classes.active : undefined
              }
            >
              Profile
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/leaderboard"
              className={({ isActive }) =>
                isActive ? classes.active : undefined
              }
            >
              Leaderboard
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/game"
              className={({ isActive }) =>
                isActive ? classes.active : undefined
              }
            >
              Game
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/chat"
              className={({ isActive }) =>
                isActive ? classes.active : undefined
              }
            >
              Chat
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                isActive ? classes.active : undefined
              }
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
