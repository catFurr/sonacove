import { describe, test, expect, beforeEach } from "bun:test";
import { KeycloakClient } from "../src/lib/modules/keycloak";
import { testEnv } from "./models.js";

// Define the test email as a constant for reuse
const TEST_EMAIL = "test-1@sonacove.com";

describe("Keycloak Flows", () => {
  let keycloakClient: KeycloakClient;

  beforeEach(() => {
    keycloakClient = new KeycloakClient(testEnv);
  });

  test("Flow: get user by email", async () => {
    const user = await keycloakClient.getUser(TEST_EMAIL);
    expect(user).not.toBeNull();
    expect(user?.id).toBe("ca0f4211-9cf8-403c-b260-c03373cb26db");
  });

  test("Flow: get user by subscription ID", async () => {
    // First get the user by email to find their subscription ID
    const emailUser = await keycloakClient.getUser(TEST_EMAIL);
    expect(emailUser).not.toBeNull();

    // Check if this user has a subscription ID
    const subscriptionId = emailUser?.attributes?.paddle_subscription_id?.[0];
    expect(subscriptionId).toBeDefined();

    if (subscriptionId) {
      // Now try to get the user by their subscription ID
      const user = await keycloakClient.getUser(undefined, subscriptionId);
      expect(user).not.toBeNull();
      expect(user?.id).toBe(emailUser?.id);
    }
  });

  test("Flow: update user and verify changes", async () => {
    // First get a user
    const user = await keycloakClient.getUser(TEST_EMAIL);
    expect(user).not.toBeNull();

    if (!user) {
      throw new Error("User should not be null");
    }

    // Store the original value to restore later
    const originalStatus =
      user.attributes?.paddle_subscription_status?.[0] || "active";

    // Update the user's subscription status to a test value
    const testStatus = originalStatus === "active" ? "test_status" : "active";

    const updates = {
      attributes: {
        paddle_subscription_status: [testStatus],
      },
    };

    // Use try-finally to ensure cleanup happens even if test assertions fail
    try {
      const result = await keycloakClient.updateUser(user, updates);
      expect(result).toBe(true);

      // Verify the changes by getting the user again
      const updatedUser = await keycloakClient.getUser(TEST_EMAIL);
      expect(updatedUser).not.toBeNull();

      if (updatedUser) {
        expect(updatedUser.attributes?.paddle_subscription_status?.[0]).toBe(
          testStatus
        );
      }
    } finally {
      // Always restore the original value, even if the test fails
      console.log(`Restoring original status: ${originalStatus}`);

      // Get the latest user state
      const latestUser = await keycloakClient.getUser(TEST_EMAIL);

      if (latestUser) {
        const restoreUpdates = {
          attributes: {
            paddle_subscription_status: [originalStatus],
          },
        };

        await keycloakClient.updateUser(latestUser, restoreUpdates);

        // Verify restoration was successful
        const restoredUser = await keycloakClient.getUser(TEST_EMAIL);
        console.log(
          `Status restored: ${restoredUser?.attributes?.paddle_subscription_status?.[0]}`
        );
      }
    }
  });
});
