import React from 'react';
import classes from '../../components/Navbar/Navbar.module.css';

export const NavbarError = () => {
  return (
    <header className={classes.header}>
      <nav>
        <ul className={classes.list}>
          <li>
            <button className="button">Dashboard</button>
          </li>
          <li>
            <button className="button">Profile</button>
          </li>
          <li>
            <button className="button">Leaderboard</button>
          </li>
          <li>
            <button className="button">Game</button>
          </li>
          <li>
            <button className="button">Chat</button>
          </li>
          <li>
            <button className="button">Settings</button>
          </li>
        </ul>
      </nav>
      <div className={classes.logout}>
        <span className={classes.quote}>“Don’t Panic”</span>
        <div className={classes.buttons}>
          <button className={classes.logoutButton}>Logout</button>
        </div>
      </div>
    </header>
  );
};

export default NavbarError;
