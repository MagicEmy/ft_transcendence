import { NavLink } from 'react-router-dom';
import classes from './MainNavigation.module.css';



function MainNavigation() {
  return (
    <header className={classes.header}>
      <nav>
        <ul className={classes.list}>
          <li>
            <NavLink 
				to="/" 
				className={({isActive}) =>
				isActive ? classes.active : undefined
				}
				end
				/* treated as active only if the current active route ends with this path	 */
				> Home
			</NavLink>
          </li>
          <li>
		  	<NavLink to="/events" 
				className={({isActive}) =>
				isActive ? classes.active : undefined
				} 
				> Profile
			</NavLink>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default MainNavigation;
