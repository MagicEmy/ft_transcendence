import { useContext } from 'react';
import UserContext from '../context/UserContext';
import { IUserContext } from '../context/userContext.types';
import classes from './Avatar.module.css';
import defaultAvatar from '../assets/defaultAvatar.png';

export const Avatar = () => {
  const { avatarContext } = useContext<IUserContext>(UserContext);
	if (!avatarContext) {
		return  <img src={defaultAvatar} className={classes.avatarImage} alt="default avatar" />;
	}
	return <img src={avatarContext} className={classes.avatarImage} alt="User avatar" />;
}

