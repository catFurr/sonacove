import { describe, test, expect, beforeEach, afterEach, mock } from "bun:test";
import { KeycloakClient } from "../src/lib/modules/keycloak";
import {
  type KeycloakUser,
  type KeycloakUserUpdate,
} from "../src/lib/modules/keycloak-types";
import { testEnv } from "./models.js";

describe("KeycloakClient", () => {
  let keycloakClient: KeycloakClient;

  // Mock the fetch function
  const originalFetch = global.fetch;
  let fetchMock: any;

  beforeEach(() => {
    keycloakClient = new KeycloakClient(testEnv);

    // Mock fetch to avoid actual API calls
    fetchMock = mock(() => {
      return Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            access_token: "mock_token",
            expires_in: 300,
          }),
        text: () => Promise.resolve(""),
      });
    });

    global.fetch = fetchMock;
  });

  afterEach(() => {
    global.fetch = originalFetch;
    fetchMock.mockClear();
  });

  test("getUser with valid email", async () => {
    // Setup mock to return a valid user
    fetchMock.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            access_token: "mock_token",
            expires_in: 300,
          }),
        text: () => Promise.resolve(""),
      })
    );

    fetchMock.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve([
            {
              id: "ca0f4211-9cf8-403c-b260-c03373cb26db",
              username: "someone@some.com",
              firstName: "Code",
              lastName: "Dead",
              email: "someone@some.com",
              emailVerified: false,
              attributes: {
                paddle_subscription_id: ["sub_01jp8rpfn61cfmeenxr0kr4j1g"],
                paddle_product_id: ["pro_01jp00qd5w88v3pwcbzpf2khh0"],
                paddle_price_id: ["pri_01jp00qykqy6wyd54gxv369hdr"],
                paddle_customer_id: ["ctm_01jp8m64pk5ftn5fqp13b8dgmx"],
                paddle_last_update: ["2025-03-13T22:06:17.331963Z"],
                paddle_subscription_status: ["active"],
                paddle_quantity: ["1"],
                paddle_collection_mode: ["automatic"],
              },
              createdTimestamp: 1741819382829,
              enabled: true,
              totp: false,
              disableableCredentialTypes: [],
              requiredActions: [],
              notBefore: 0,
              access: {
                manageGroupMembership: true,
                view: true,
                mapRoles: true,
                impersonate: false,
                manage: true,
              },
            },
          ]),
        text: () => Promise.resolve(""),
      })
    );

    const user = await keycloakClient.getUser("someone@some.com");

    expect(user).not.toBeNull();
    expect(user?.id).toBe("ca0f4211-9cf8-403c-b260-c03373cb26db");
  });

  test("getUser with invalid email", async () => {
    // Setup mock to return a valid token but no user
    fetchMock.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            access_token: "mock_token",
            expires_in: 300,
          }),
        text: () => Promise.resolve(""),
      })
    );

    fetchMock.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
        text: () => Promise.resolve(""),
      })
    );

    const user = await keycloakClient.getUser("example@some.com");

    expect(user).toBeNull();
  });

  test("getUser with valid subscription ID", async () => {
    // Setup mock to return a valid user
    fetchMock.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            access_token: "mock_token",
            expires_in: 300,
          }),
        text: () => Promise.resolve(""),
      })
    );

    fetchMock.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve([
            {
              id: "ca0f4211-9cf8-403c-b260-c03373cb26db",
              username: "someone@some.com",
              firstName: "Code",
              lastName: "Dead",
              email: "someone@some.com",
              emailVerified: false,
              attributes: {
                paddle_subscription_id: ["sub_01jp8rpfn61cfmeenxr0kr4j1g"],
                paddle_product_id: ["pro_01jp00qd5w88v3pwcbzpf2khh0"],
                paddle_price_id: ["pri_01jp00qykqy6wyd54gxv369hdr"],
                paddle_customer_id: ["ctm_01jp8m64pk5ftn5fqp13b8dgmx"],
                paddle_last_update: ["2025-03-13T22:06:17.331963Z"],
                paddle_subscription_status: ["active"],
                paddle_quantity: ["1"],
                paddle_collection_mode: ["automatic"],
              },
              createdTimestamp: 1741819382829,
              enabled: true,
            },
          ]),
        text: () => Promise.resolve(""),
      })
    );

    const user = await keycloakClient.getUser(
      undefined,
      "sub_01jp8rpfn61cfmeenxr0kr4j1g"
    );

    expect(user).not.toBeNull();
    expect(user?.id).toBe("ca0f4211-9cf8-403c-b260-c03373cb26db");
  });

  test("getUser with invalid subscription ID", async () => {
    // Setup mock to return a valid token but no user
    fetchMock.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            access_token: "mock_token",
            expires_in: 300,
          }),
        text: () => Promise.resolve(""),
      })
    );

    fetchMock.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
        text: () => Promise.resolve(""),
      })
    );

    const user = await keycloakClient.getUser(undefined, "invalid_sub");

    expect(user).toBeNull();
  });

  test("updateUser successfully updates user attributes", async () => {
    // Setup mock for token and update
    fetchMock.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            access_token: "mock_token",
            expires_in: 300,
          }),
        text: () => Promise.resolve(""),
      })
    );

    fetchMock.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        status: 204,
        text: () => Promise.resolve(""),
      })
    );

    const user: KeycloakUser = {
      id: "ca0f4211-9cf8-403c-b260-c03373cb26db",
      attributes: {
        paddle_subscription_id: ["sub_01jp8rpfn61cfmeenxr0kr4j1g"],
        paddle_subscription_status: ["active"],
      },
    };

    const updates: KeycloakUserUpdate = {
      attributes: {
        paddle_subscription_status: ["cancelled"],
      },
    };

    const result = await keycloakClient.updateUser(user, updates);

    expect(result).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  test("updateUser throws error on update failure", async () => {
    // Setup mock for token and failed update
    fetchMock.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            access_token: "mock_token",
            expires_in: 300,
          }),
        text: () => Promise.resolve(""),
      })
    );

    fetchMock.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 400,
        text: () => Promise.resolve("Bad Request"),
      })
    );

    const user: KeycloakUser = {
      id: "ca0f4211-9cf8-403c-b260-c03373cb26db",
      attributes: {
        paddle_subscription_id: ["sub_01jp8rpfn61cfmeenxr0kr4j1g"],
        paddle_subscription_status: ["active"],
      },
    };

    const updates: KeycloakUserUpdate = {
      attributes: {
        paddle_subscription_status: ["cancelled"],
      },
    };

    expect(keycloakClient.updateUser(user, updates)).rejects.toThrow(
      "Failed to update user"
    );
  });
});
