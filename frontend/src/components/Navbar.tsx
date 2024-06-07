import React, { useContext, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import classes from './Navbar.module.css';
import LogoutButton from './LogoutButton';
import UserContext, { IUserContext } from '../context/UserContext';
import useStorage from "../hooks/useStorage";
import { loadProfileAvatar } from '../utils/profileUtils';
import { NavigationButton } from './NavigationButton';
import { isLinkActive } from '../utils/isLinkActive';

export const Navbar = () => {
  const {
    userNameContext,
    avatarContext,
    setAvatarContext,
  } = useContext<IUserContext>(UserContext);
  const [userIdStorage, ,] = useStorage<string>('userId', '');


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
              replace={true}
              end
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavigationButton
              to="/profile"
              className={isLinkActive('/profile') ? classes.active : undefined}

            >
              Profile
            </NavigationButton>
          </li>
          <li>
            <NavLink
              to="/leaderboard"
              className={({ isActive }) =>
                isActive ? classes.active : undefined
              }
              replace={true}
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
              replace={true}
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
              replace={true}
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
              replace={true}
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

//window.location  in console!!
