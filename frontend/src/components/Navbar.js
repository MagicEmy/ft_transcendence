import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import classes from "./Navbar.module.css";
import LogoutButton from "./LogoutButton";
import useStorage from "../hooks/useStorage";
import { loadProfile, loadProfileAvatar } from "../libs/profileData";


function Navbar() {
	const [user] = useStorage('user', null)
  const [userName, setUserName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  useEffect(() => {
    if (user && user.user_id) {
      const fetcDbProfile = async () => {
        try {
          const dbProfile = await loadProfile(user.user_id);
          setUserName(dbProfile.user_name);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };
      fetcDbProfile();
    }
    else {
      setUserName('Guest');
    }
  }, [user]);

  useEffect(() => {
    if (user && user.user_id) {
      const fetchAvatar = async () => {
        try {
          const imageUrl = await loadProfileAvatar(user.user_id);
          setAvatarUrl(imageUrl);
        } catch (error) {
          console.error('Error fetching avatar:', error.message);
        }
      };

      fetchAvatar();

      // return () => {
      //   if (avatarUrl) {
      //     URL.revokeObjectURL(avatarUrl);
      //   }
      // };
    }
  }, [user]);

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
            {avatarUrl ? <img className={classes.avatarImage} src={avatarUrl} alt="User Avatar" /> : <p>Loading...</p>}
            <span>{userName?.user_name}</span>
          </div>
        </NavLink>
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
