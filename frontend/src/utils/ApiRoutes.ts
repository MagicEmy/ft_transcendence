const host = process.env.REACT_APP_HOST || 'localhost';
const gatewayPort = process.env.REACT_APP_GATEWAY_PORT || '3001';
const authPort = process.env.REACT_APP_AUTH_PORT || '3003';

const gatewayUrl = `https://${host}:${gatewayPort}`;
const authUrl = `https://${host}:${authPort}`;

export {
  host,
  gatewayUrl,
  authUrl
};
