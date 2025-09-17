import { describe, it, beforeAll, expect } from "bun:test";
import { getTestEnvironment } from "./helpers/environment";

describe("API: /api/paddle-customer-portal", () => {
  let authToken: string;
  let apiEndpoint: string;

  beforeAll(async () => {
    const {
      TEST_AUTH_TOKEN,
      TEST_API_ENDPOINT
    } = getTestEnvironment();

    authToken = TEST_AUTH_TOKEN;
    apiEndpoint = TEST_API_ENDPOINT + '/api/paddle-customer-portal';
  });

  it("should return 401 without authorization header", async () => {
    const response = await fetch(apiEndpoint, {
      method: "GET",
    });

    expect(response.status).toBe(401);
  });

  it("should return 401 with invalid token", async () => {
    const response = await fetch(apiEndpoint, {
      method: "GET",
      headers: {
        Authorization: "Bearer invalid-token",
      },
    });

    expect(response.status).toBe(401);
  });

  it("should return 401 with malformed authorization header", async () => {
    const response = await fetch(apiEndpoint, {
      method: "GET",
      headers: {
        Authorization: "InvalidFormat token",
      },
    });

    expect(response.status).toBe(401);
  });

  it("should return customer portal URL with valid auth token", async () => {
    const response = await fetch(apiEndpoint, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    expect(response.status).toBe(200);
    
    const data: any = await response.json();
    expect(data).toHaveProperty("url");
    expect(typeof data.url).toBe("string");
    expect(data.url).toContain("https://");
  });

});