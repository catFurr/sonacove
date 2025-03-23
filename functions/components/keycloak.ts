import { Env } from "../api/paddle-webhook.js";
import {
  KeycloakTokenResponse,
  KeycloakUser,
  KeycloakUserUpdate,
} from "./keycloak-types.js";

const tokenEndpoint =
  "https://auth.sonacove.com/realms/jitsi/protocol/openid-connect/token";
const userEndpoint = "https://auth.sonacove.com/admin/realms/jitsi/users/";

const tokenKey = "keycloak_token";
const tokenExpiryKey = "keycloak_token_expiry";

export class KeycloakClient {
  private env: Env;
  private token: string;

  constructor(env: Env) {
    this.env = env;
  }

  private async saveToken(
    this: KeycloakClient,
    token: string,
    expiresIn: number
  ) {
    // Cache the token and its expiry time
    const expiryTime = Date.now() + expiresIn * 1000;
    await this.env.KV.put(tokenKey, token);
    await this.env.KV.put(tokenExpiryKey, expiryTime.toString());
  }

  private async getToken(this: KeycloakClient): Promise<string | null> {
    // Check if we have a cached token in KV
    const cachedToken = await this.env.KV.get(tokenKey);
    const cachedExpiry = await this.env.KV.get(tokenExpiryKey);

    // If we have a cached token and it's not expired, use it
    if (cachedToken && cachedExpiry) {
      const expiryTime = parseInt(cachedExpiry);
      // Add a 60-second buffer to ensure we don't use an about-to-expire token
      if (Date.now() < expiryTime - 60000) {
        return cachedToken;
      }
    }

    // Return null if no valid token is found
    return null;
  }

  private async fetchToken(this: KeycloakClient) {
    // Try to get the token from the cache
    const cachedToken = await this.getToken();
    if (cachedToken) this.token = cachedToken;

    // Otherwise, get a new token
    const formData = new URLSearchParams();
    formData.append("grant_type", "client_credentials");
    formData.append("client_id", this.env.KEYCLOAK_CLIENT_ID);
    formData.append("client_secret", this.env.KEYCLOAK_CLIENT_SECRET);

    const response = await fetch(tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get Keycloak token: ${error}`);
    }
    const data = (await response.json()) as KeycloakTokenResponse;
    await this.saveToken(data.access_token, data.expires_in);

    this.token = data.access_token;
  }

  async getUser(
    this: KeycloakClient,
    email?: string,
    subscriptionId?: string
  ): Promise<KeycloakUser | null> {
    if (!email && !subscriptionId)
      throw new Error("Either email or subscriptionId must be provided");
    if (!this.token) await this.fetchToken();
    if (!this.token) throw new Error("Failed to get Keycloak token");

    // Use either email or subscriptionId to get the user
    // giving preference to email
    const query = email
      ? `?email=${encodeURIComponent(email)}`
      : `?q=paddle_subscription_id:${subscriptionId}`;
    const response = await fetch(userEndpoint + query, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get Keycloak user: ${error}`);
    }
    const data = (await response.json()) as KeycloakUser[];

    // Return the first matching user, if any
    return data.length > 0 ? data[0] : null;
  }

  async updateUser(
    this: KeycloakClient,
    user: KeycloakUser,
    attributes: KeycloakUserUpdate
  ): Promise<boolean> {
    if (!this.token) await this.fetchToken();
    if (!this.token) throw new Error("Failed to get Keycloak token");

    // Create a deep copy of the user object
    const userData = { ...user };

    // If there are attributes to update
    if (attributes.attributes && userData.attributes) {
      // For each attribute in the update
      for (const [key, value] of Object.entries(attributes.attributes)) {
        if (value !== undefined) {
          // Update the specific attribute
          userData.attributes[key as keyof typeof userData.attributes] = value;
        }
      }
    } else if (attributes.attributes) {
      // If the user doesn't have attributes yet, but we're adding some
      userData.attributes = attributes.attributes;
    }

    // Update non-attribute fields if provided
    if (attributes.firstName !== undefined)
      userData.firstName = attributes.firstName;
    if (attributes.lastName !== undefined)
      userData.lastName = attributes.lastName;
    if (attributes.email !== undefined) userData.email = attributes.email;
    if (attributes.emailVerified !== undefined)
      userData.emailVerified = attributes.emailVerified;
    if (attributes.enabled !== undefined) userData.enabled = attributes.enabled;

    // Send the update
    const updateResponse = await fetch(userEndpoint + user.id, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    if (!updateResponse.ok) {
      const error = await updateResponse.text();
      throw new Error(`Failed to update user: ${error}`);
    }
    return true;
  }
}
