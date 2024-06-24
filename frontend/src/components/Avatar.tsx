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


/*
export const Avatar = () => {
  const { userIdContext, avatarContext } = useContext<IUserContext>(UserContext);
  const { avatar: avatarUrl } = useGetAvatarUrl(userIdContext);

  let avatarRender = avatarContext || avatarUrl;
	if (!avatarContext) {
		return <p>Loading avatar...</p>;
	}
	return <img src={avatarRender} className={classes.avatarImage} alt="User avatar" />;
}

*/
