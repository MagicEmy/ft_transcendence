const host = process.env.REACT_APP_HOST;
const gatewayPort = process.env.REACT_APP_GATEWAY_PORT;
const authPort = process.env.REACT_APP_AUTH_PORT;

const gatewayUrl = `https://${host}:${gatewayPort}`;
const authUrl = `https://${host}:${authPort}`;

export {
  host,
  gatewayUrl,
  authUrl
};
