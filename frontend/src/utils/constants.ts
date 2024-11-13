import { host } from './ApiRoutes';

export const SOCKET_URL = `http://${host}:3001`;
export const JWT_CHECK = `http://${host}:3001/jwtValid`;
export const LOGIN_AUTH0 = `http://${host}:3003/auth/42/login`;
export const USER = `http://${host}:3001/profile`; //get user basic data without parameters - user profile with parameters or param null
export const FRIENDS = `http://${host}:3001/friends`; //get friends
export const ADD_FRIEND = `http://${host}:3001/friend`; //add friend
export const DEL_FRIEND = `http://${host}:3001/friend`; //delete friend
export const GAMES = `http://${host}:3001/games`; //get games
export const STATUS = `http://${host}:3001/status`; //get or update status
export const LOGOUT = `http://${host}:3001/logout`; //logout
export const CHANGE_NAME = `http://${host}:3001/username`; //change username
export const LEADERBOARD = `http://${host}:3001/leaderboard`; //get leaderboard
export const AVATAR = `http://${host}:3001/avatar`; //load or upload avatar
export const TFA_QR = `http://${host}:3003/TwoFactorAuth/create`; //QR base64 string
export const TFA_ENABLE = `http://${host}:3003/TwoFactorAuth/enable`; //VERIFY CODE
export const TFA_VALIDATE = `http://${host}:3003/auth/tfa/authenticate `; //VERIFY CODE
export const TFA_DISABLE = `http://${host}:3003/TwoFactorAuth/disable`;
export const TFA_STATUS = `http://${host}:3003/TwoFactorAuth/isEnabled?id=`; //check if tfa is enabled
