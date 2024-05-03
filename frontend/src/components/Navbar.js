import React from "react";
import { NavLink } from "react-router-dom";
import classes from "./Navbar.module.css";
import avatar from "../../src/assets/Thai.jpg";
import LogoutButton from "./LogoutButton";
// import useStorage from "../hooks/useStorage";


function Navbar() {
	// const [userProfile] = useStorage("user");
	

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
            <img className={classes.avatarImage} src={avatar} alt="Avatar" />
          </NavLink>
		  {/* <div className={classes.list}>
				{userProfile.user_name}</div> */}
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
