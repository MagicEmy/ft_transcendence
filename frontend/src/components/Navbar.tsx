import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import classes from './Navbar.module.css';
import LogoutButton from './LogoutButton';
import useStorage from '../hooks/useStorage';
import { loadProfile, loadProfileAvatar } from '../utils/profileData';

interface UserProfile {
  user_id: string;
  user_name: string;
}

const Navbar = () => {
  const [userProfile] = useStorage<UserProfile | null>('user', null);
  const [avatar, setAvatar] = useStorage<string>('avatar', '');
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    const fetchUserData = async () => {
      if (userProfile?.user_id) {
        try {
          const dbProfile = await loadProfile(userProfile.user_id);
          const imageUrl = await loadProfileAvatar(userProfile.user_id);
          setUserName(dbProfile.user_name);
          setAvatar(imageUrl || '');
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    fetchUserData();
  }, [userProfile, setAvatar, setUserName]);

  return (
    <header className={classes.header}>
      <div className={classes.avatar}>
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
            <span>{userName}</span>
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
};

export default Navbar;
