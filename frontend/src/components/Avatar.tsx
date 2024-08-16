import { useContext } from 'react';
import UserContext from '../context/UserContext';
import { IUserContext } from '../context/userContext.types';
import classes from './Avatar.module.css';
import defaultAvatar from '../assets/defaultAvatar.png';

export const Avatar = () => {
  const { avatarContext } = useContext<IUserContext>(UserContext);
  const avatarImage = avatarContext ? avatarContext : defaultAvatar;

  return (
    <img src={avatarImage} className={classes.avatarImage} alt="User avatar" />
  );
};
