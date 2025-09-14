import { describe, it, beforeAll, expect } from "bun:test";
import { getTestEnvironment } from "./helpers/environment";

describe("API: /api/registration-flow", () => {
  let kcToken: string;
  let apiEndpoint: string;
  const testEmail = `test-${Date.now()}@example.com`;

  beforeAll(async () => {
    const {
      KC_WEBHOOK_SECRET,
      TEST_API_ENDPOINT
    } = getTestEnvironment();

    kcToken = KC_WEBHOOK_SECRET;
    apiEndpoint = TEST_API_ENDPOINT + '/api/registration-flow';
  });

  it("should return 401 without authorization header", async () => {
    const response = await fetch(apiEndpoint, {
      method: "POST",
      body: JSON.stringify({
        firstname: "Test",
        lastname: "User",
        email: testEmail,
        email_verified: true
      }),
    });

    expect(response.status).toBe(401);
  });

  it("should return 401 with invalid webhook secret", async () => {
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        Authorization: "Bearer invalid-secret",
      },
      body: JSON.stringify({
        firstname: "Test",
        lastname: "User",
        email: testEmail,
        email_verified: true
      }),
    });

    expect(response.status).toBe(401);
  });

  it("should return 400 for invalid JSON", async () => {
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${kcToken}`,
        "Content-Type": "application/json",
      },
      body: "invalid json",
    });

    expect(response.status).toBe(400);
  });

  it("should return 400 for missing required fields", async () => {
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${kcToken}`,
      },
      body: JSON.stringify({
        firstname: "Test",
        // Missing lastname and email
      }),
    });

    expect(response.status).toBe(400);
  });

  it.skip("should handle registration flow successfully", async () => {
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${kcToken}`,
      },
      body: JSON.stringify({
        firstname: "Test",
        lastname: "User",
        email: testEmail,
        email_verified: true
      }),
    });

    expect(response.status).toBe(200);
  });

});