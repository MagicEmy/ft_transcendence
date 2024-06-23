import { useContext } from 'react';
import UserContext from '../context/UserContext';
import { IUserContext } from '../context/userContext.types';
import classes from './Avatar.module.css';

export const Avatar = () => {
  const { avatarContext } = useContext<IUserContext>(UserContext);
	if (!avatarContext) {
		return <p>Loading avatar...</p>;
	}
	return <img src={avatarContext} className={classes.avatarImage} alt="User avatar" />;
}
