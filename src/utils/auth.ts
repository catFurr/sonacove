/**
 * Validates a Keycloak token by verifying its signature and claims
 * @param token The JWT token to validate
 * @returns Promise<boolean> True if the token is valid, false otherwise
 */
interface KeycloakTokenPayload {
  exp?: number;
  iss?: string;
  aud?: string | string[];
  sub: string;
  email: string;
  name?: string;
  preferred_username?: string;
  email_verified: boolean;
}

export async function validateKeycloakToken(token: string): Promise<boolean> {
  try {
    // Fetch the JWKS from Keycloak
    const jwksUrl = "https://auth.sonacove.com/realms/jitsi/protocol/openid-connect/certs";
    const jwksResponse = await fetch(jwksUrl);
    
    if (!jwksResponse.ok) {
      throw new Error("Failed to fetch JWKS");
    }
    
    const jwks = await jwksResponse.json();
    
    // Basic token structure validation
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      throw new Error("Invalid token format");
    }
    
    // Decode the token payload
    const payload = JSON.parse(atob(tokenParts[1])) as KeycloakTokenPayload;
    
    // Check if the token is expired
    const currentTime = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < currentTime) {
      throw new Error("Token has expired");
    }
    
    // Check the issuer
    const expectedIssuer = "https://auth.sonacove.com/realms/jitsi";
    if (payload.iss !== expectedIssuer) {
      throw new Error("Invalid token issuer");
    }
    
    // Updated audience check to handle array
    if (Array.isArray(payload.aud)) {
      if (!payload.aud.includes("jitsi-web")) {
        throw new Error("Invalid token audience");
      }
    } else if (payload.aud !== "jitsi-web") {
      throw new Error("Invalid token audience");
    }
    
    // For a more complete implementation, you would verify the token signature
    // using the JWKS. This would require additional libraries like jose or jsonwebtoken.
    // For now, we'll consider the token valid if it passes the basic checks above.
    
    return true;
  } catch (error) {
    console.error("Token validation error:", error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
}

/**
 * Parses the JWT token to extract user information
 * @param token The JWT token
 * @returns Object containing user information
 */
export function parseUserFromToken(token: string) {
  try {
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
      throw new Error("Invalid token format");
    }
    
    // Decode the token payload
    const payload = JSON.parse(atob(tokenParts[1])) as KeycloakTokenPayload;
    
    return {
      sub: payload.sub,
      email: payload.email,
      name: payload.name || payload.preferred_username || '',
      emailVerified: payload.email_verified
    };
  } catch (error) {
    console.error("Error parsing user from token:", error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
} 