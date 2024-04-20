import React from "react";
import { NavLink } from "react-router-dom";
import classes from "./Navbar.module.css";
import avatar from "../../src/assets/Thai.jpg";
import LogoutButton from "./auth/LogoutButton";

function Navbar() {
  return (
    <header className={classes.header}>
      <div className={classes.avatar}>
        <span >

      <NavLink
              to="/profile"
              className={({ isActive }) =>
              isActive ? classes.active : undefined
            }
            >
              Profile
            </NavLink>

        <img className={classes.avatarImage} src={avatar} alt="Avatar" />
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
            <LogoutButton className={classes.logoutButton}/>
      </div>
    </header>
  );
}

export default Navbar;
