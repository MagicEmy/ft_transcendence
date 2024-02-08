import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

import classes from './EventsNavigation.module.css';

const StyledNavLink = styled(NavLink)`
  padding: 1rem 2rem;
  font-weight: 600;
//   text-transform: uppercase;
  border-radius: 0.25rem;
  color: #1f2937;
  background-color: #871818;
  border-radius: 6px;
  border: none;
  text-decoration: none; /* Ensure NavLink behaves like a button */

  &:hover {
    background-color: #c74444;
  }
`;

function EventsNavigation() {
  return (
    <header className={classes.header}>
      <nav>
        <ul className={classes.list}>
		<li>
            <StyledNavLink 
				to="/" 
				className={({isActive}) => 
				isActive ? classes.active : undefined} 
				end >
				Login Page
			</StyledNavLink>
          </li>
          <li>
            <NavLink 
				to="/events" 
				className={({isActive}) => 
				isActive ? classes.active : undefined} 
				end >
				Profile
			</NavLink>
          </li>
		  <li>
            <NavLink 
				to="/events/game" 
				className={({isActive}) => 
				isActive ? classes.active : undefined}
				>
				Game
			</NavLink>
          </li>
          <li>
            <NavLink 
				to="/events/chat" 
				className={({isActive}) => 
				isActive ? classes.active : undefined}
				>
				Chat
			</NavLink>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default EventsNavigation;
