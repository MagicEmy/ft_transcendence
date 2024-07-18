import { host, gatewayUrl, authUrl } from './ApiRoutes';

export const SOCKET_URL = `http://${host}:3001`;
export const JWT_CHECK = `http://${host}:3001/jwtValid`;
export const LOGIN_AUTH0 = `http://${host}:3003/auth/42/login`;
export const USER = `http://${host}:3001/profile`;
export const FRIENDS = `http://${host}:3001/friends`;
export const ADD_FRIEND = `http://${host}:3001/friend`;
export const DEL_FRIEND = `http://${host}:3001/friend`;
export const GAMES = `http://${host}:3001/games`;
export const STATUS = `http://${host}:3001/status`;
export const LOGOUT = `http://${host}:3001/logout`;
export const CHANGE_NAME = `http://${host}:3001/username`;
export const LEADERBOARD = `http://${host}:3001/leaderboard`;
export const AVATAR = `http://${host}:3001/avatar`;
export const TFA_QR = `http://${host}:3003/TwoFactorAuth/create`; //QR base64 string
export const TFA_ENABLE = `http://${host}:3003/TwoFactorAuth/enable`; //VERIFY CODE
export const TFA_VALIDATE = `http://${host}:3003/auth/tfa/authenticate `; //VERIFY CODE
export const TFA_DISABLE = `http://${host}:3003/TwoFactorAuth/disable`;
export const TFA_STATUS = `http://${host}:3003/TwoFactorAuth/isEnabled?id=`; //check if tfa is enabled

/*
export const LOGIN_AUTH0 = `${authUrl}/auth/42/login`;
export const TFA_QR = `${authUrl}/TwoFactorAuth/create`; //QR base64 string
export const TFA_ENABLE = `${authUrl}/TwoFactorAuth/enable`; //VERIFY CODE
export const TFA_VALIDATE = `${authUrl}/auth/tfa/authenticate `; //VERIFY CODE
export const TFA_DISABLE = `${authUrl}/TwoFactorAuth/disable`;
export const TFA_STATUS = `${authUrl}/TwoFactorAuth/isEnabled?id=`; //check if tfa is enabled
export const SOCKET_URL = `${gatewayUrl}`;
export const JWT_CHECK = `${gatewayUrl}/jwtValid`;
export const USER = `${gatewayUrl}/profile`;
export const FRIENDS = `${gatewayUrl}/friends`;
export const ADD_FRIEND = `${gatewayUrl}/friend`;
export const DEL_FRIEND = `${gatewayUrl}/friend`;
export const GAMES = `${gatewayUrl}/games`;
export const STATUS = `${gatewayUrl}/status`;
export const LOGOUT = `${gatewayUrl}/logout`;
export const CHANGE_NAME = `${gatewayUrl}/username`;
export const LEADERBOARD = `${gatewayUrl}/leaderboard`;
export const AVATAR = `${gatewayUrl}/avatar`;

*/
