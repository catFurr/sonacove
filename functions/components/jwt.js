// Helper for validating Keycloak JWTs using JWKS
import { jwtVerify, createRemoteJWKSet } from "jose";

const JWKS_URL =
  "https://auth.sonacove.com/realms/jitsi/protocol/openid-connect/certs";
const ISSUER = "https://auth.sonacove.com/realms/jitsi";
const AUDIENCE = "jitsi-web";

let jwks;

export async function validateKeycloakJWT(token) {
  try {
    if (!jwks) {
      jwks = createRemoteJWKSet(new URL(JWKS_URL));
    }
    const { payload } = await jwtVerify(token, jwks, {
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    // Optionally check exp, email_verified, etc. here
    return true;
  } catch (e) {
    console.error("JWT validation failed:", e);
    return false;
  }
}

export function getEmailFromJWT(token) {
  try {
    const [, payloadB64] = token.split(".");
    const payload = JSON.parse(
      Buffer.from(payloadB64, "base64").toString("utf8")
    );
    return payload.email;
  } catch (e) {
    return null;
  }
}
