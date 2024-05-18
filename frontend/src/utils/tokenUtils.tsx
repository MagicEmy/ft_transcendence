interface JwtPayload {
	sub: string;  // 'sub' is commonly used to store userId in JWT
	[key: string]: any;
  }
  
  export interface TokenUserDetails {
	userId: string;
	[key: string]: any;
  }
  
  export const extractUserIdFromToken = (token: string): TokenUserDetails | null => {
	try {
	  // Split the token into its parts
	  const payload = token.split('.')[1];
  
	  // Decode the base64 URL-encoded payload
	  const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
  
	  // Parse the JSON payload
	  const payloadObject: JwtPayload = JSON.parse(decodedPayload);
  
	  // Extract and return user details
	  return {
		userId: payloadObject.sub,
		...payloadObject,
	  };
	} catch (error) {
	  console.error('Failed to extract user details from token:', error);
	  return null;
	}
  };
  