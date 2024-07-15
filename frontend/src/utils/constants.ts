import { HOST, GATEWAY_URL, AUTH_URL } from './ApiRoutes';

export const SOCKET_URL = `http://${HOST}:3001`;
export const JWT_CHECK = `http://${HOST}:3001/jwtValid`;
export const LOGIN_AUTH0 = `http://${HOST}:3003/auth/42/login`;
export const USER = `http://${HOST}:3001/profile`;
export const FRIENDS = `http://${HOST}:3001/friends`;
export const ADD_FRIEND = `http://${HOST}:3001/friend`;
export const DEL_FRIEND = `http://${HOST}:3001/friend`;
export const GAMES = `http://${HOST}:3001/games`;
export const STATUS = `http://${HOST}:3001/status`;
export const LOGOUT = `http://${HOST}:3001/logout`;
export const CHANGE_NAME = `http://${HOST}:3001/username`;
export const LEADERBOARD = `http://${HOST}:3001/leaderboard`;
export const AVATAR = `http://${HOST}:3001/avatar`;
export const TFA_QR = `http://${HOST}:3003/TwoFactorAuth/create`; //QR base64 string
export const TFA_ENABLE = `http://${HOST}:3003/TwoFactorAuth/enable`; //VERIFY CODE
export const TFA_VALIDATE = `http://${HOST}:3003/auth/tfa/authenticate `; //VERIFY CODE
export const TFA_DISABLE = `http://${HOST}:3003/TwoFactorAuth/disable`;
export const TFA_STATUS = `http://${HOST}:3003/TwoFactorAuth/isEnabled?id=`; //check if tfa is enabled

/*
export const LOGIN_AUTH0 = `${AUTH_URL}/auth/42/login`;
export const TFA_QR = `${AUTH_URL}/TwoFactorAuth/create`; //QR base64 string
export const TFA_ENABLE = `${AUTH_URL}/TwoFactorAuth/enable`; //VERIFY CODE
export const TFA_VALIDATE = `${AUTH_URL}/auth/tfa/authenticate `; //VERIFY CODE
export const TFA_DISABLE = `${AUTH_URL}/TwoFactorAuth/disable`;
export const TFA_STATUS = `${AUTH_URL}/TwoFactorAuth/isEnabled?id=`; //check if tfa is enabled
export const SOCKET_URL = `${GATEWAY_URL}`;
export const JWT_CHECK = `${GATEWAY_URL}/jwtValid`;
export const USER = `${GATEWAY_URL}/profile`;
export const FRIENDS = `${GATEWAY_URL}/friends`;
export const ADD_FRIEND = `${GATEWAY_URL}/friend`;
export const DEL_FRIEND = `${GATEWAY_URL}/friend`;
export const GAMES = `${GATEWAY_URL}/games`;
export const STATUS = `${GATEWAY_URL}/status`;
export const LOGOUT = `${GATEWAY_URL}/logout`;
export const CHANGE_NAME = `${GATEWAY_URL}/username`;
export const LEADERBOARD = `${GATEWAY_URL}/leaderboard`;
export const AVATAR = `${GATEWAY_URL}/avatar`;

*/
