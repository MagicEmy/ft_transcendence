const HOST = process.env.REACT_APP_HOST || 'localhost';
const GATEWAY_URL = `https://${HOST}:${process.env.REACT_APP_GATEWAY_PORT}`;
const AUTH_URL = `https://${HOST}:${process.env.REACT_APP_AUTH_PORT}`;

export {
  HOST,
  GATEWAY_URL,
  AUTH_URL
};
