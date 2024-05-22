import React, { useContext, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import classes from './Navbar.module.css';
import LogoutButton from './LogoutButton';
import UserContext from '../context/UserContext';
import { loadProfileAvatar } from '../utils/profileUtils';

interface IUserContext {
	userIdContext: string;
	userNameContext: string;
	setUserNameContext: (userName: string) => void;
	avatarContext: string | null;
	setAvatarContext: (avatar: string | null) => void;
	tfaEnabled: boolean;
	setTfaEnabled: (isEnabled: boolean) => void;
	isLoading: boolean;
  }

function Navbar() {
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
  }, [userIdContext, setAvatarContext, avatarContext]);

  return (
    <header className={classes.header}>
      <div className={classes.avatar}>
        <NavLink
          to="/profile"
          className={({ isActive }) => isActive ? classes.active : undefined}
        >
          <div className={classes.avatarImage}>
            {avatarContext ? <img src={avatarContext} alt="User Avatar" className={classes.avatarImage} /> : <p>Loading...</p>}
          </div>
        </NavLink>
        <span className={classes.name}>{userNameContext}</span>
      </div>
      <nav>
        <ul className={classes.list}>
          {/* other navigation links */}
        </ul>
      </nav>
      <div className={classes.buttons}>
        <LogoutButton className={classes.logoutButton} />
      </div>
    </header>
  );
}

export default Navbar;
