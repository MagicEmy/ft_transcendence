import React from 'react';
import classes from '../../components/Navbar/Navbar.module.css';

export const NavbarError = () => {
  return (
    <header
      className={classes.header}
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <nav>
        <h1 className={classes.name}>“Don’t Panic”</h1>
      </nav>
    </header>
  );
};

export default NavbarError;
