import React, { useEffect, useState, useContext } from "react";
import { NavLink } from "react-router-dom";
import classes from "./Navbar.module.css";
import LogoutButton from "./LogoutButton";
import useStorage from "../hooks/useStorage";
import { loadProfileAvatar } from "../libs/profileData";
import AuthContext from "../context/AuthContext";

function Navbar() {
  const [userProfile] = useStorage("user");
  const [userName, setUserName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState('');
  const {authToken} = useContext(AuthContext);

  useEffect(() => {
    setUserName(userProfile?.user_name);
  }, [userProfile]);

  useEffect(() => {
    const fetchAvatar = async () => {
      try {
        const imageUrl = await loadProfileAvatar(authToken, userProfile.user_id);
        setAvatarUrl(imageUrl);
      } catch (error) {
        console.error('Error fetching avatar:', error.message); // Adjusted to log error.message
      }
    };

    fetchAvatar();
    return () => {
      if (avatarUrl) {
        URL.revokeObjectURL(avatarUrl);
      }
    };
  }, [authToken, userProfile.user_id]);

  return (
    <header className={classes.header}>
      <div className={classes.avatar}>
        <span>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              isActive ? classes.active : undefined
            }
          >
            <div>
            {avatarUrl ? <img className={classes.avatarImage} src={avatarUrl} alt="User Avatar" /> : <p>Loading...</p>}
            </div>
          </NavLink>
		  <div className={classes.list}>
				{userProfile?.user_name}</div>
        </span>
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
        </ul>
      </nav>
      {/* <div className={classes.logo}>
        <img className={classes.logoImage} src={logo} alt="Logo" />

      </div> */}
      <div className={classes.buttons}>
        <LogoutButton className={classes.logoutButton} />
      </div>
    </header>
  );
}

export default Navbar;
