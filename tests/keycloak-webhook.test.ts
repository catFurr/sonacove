import { describe, test, expect, beforeEach, mock } from "bun:test";
import { PaddleClient } from "../functions/components/paddle.js";
import { BrevoClient } from "../functions/components/brevo.js";
import type { KeycloakUser } from "../functions/components/keycloak-types.js";

// Mock handlers
const originalPaddleFetchCustomer = PaddleClient.fetchCustomer;
const originalPaddleUpdateCustomer = PaddleClient.updateCustomer;
const originalBrevoGetContact = BrevoClient.getContact;
const originalBrevoUpdateContact = BrevoClient.updateContact;
const originalBrevoCreateContact = BrevoClient.createContact;

describe("Keycloak Webhook API", () => {
  // Import the request handler
  let handler: any;

  beforeEach(async () => {
    const module = await import("../functions/api/keycloak-webhook.js");
    handler = module.onRequest;

    // Reset mocks before each test
    PaddleClient.fetchCustomer = originalPaddleFetchCustomer;
    PaddleClient.updateCustomer = originalPaddleUpdateCustomer;
    BrevoClient.getContact = originalBrevoGetContact;
    BrevoClient.updateContact = originalBrevoUpdateContact;
    BrevoClient.createContact = originalBrevoCreateContact;
  });

  const mockEnv = {
    PADDLE_API_KEY: "test-paddle-key",
    BREVO_API_KEY: "test-brevo-key",
    KEYCLOAK_WEBHOOK_SECRET: "test-webhook-secret",
  };

  const mockContext = (body: any, method = "POST", includeAuth = true) => ({
    request: {
      method,
      json: () => Promise.resolve(body),
      headers: {
        get: (name: string) =>
          name === "Authorization" && includeAuth
            ? "Bearer test-webhook-secret"
            : null,
      },
    },
    env: mockEnv,
    waitUntil: (promise: Promise<any>) => promise,
  });

  // Sample Keycloak webhook payload
  const createWebhookPayload = (
    userData: Partial<KeycloakUser>,
    operationType = "UPDATE"
  ) => ({
    time: Date.now(),
    type: "USER_UPDATE",
    realmId: "jitsi",
    representation: userData,
    operationType: operationType,
    resourcePath: `/users/${userData.id}`,
    resourceType: "USER",
  });

  test("Should return 401 when no authentication provided", async () => {
    const userData: Partial<KeycloakUser> = {
      id: "user-123",
      email: "john@example.com",
      firstName: "John",
      lastName: "Doe",
    };

    const webhookPayload = createWebhookPayload(userData);
    const context = mockContext(webhookPayload, "POST", false); // No auth

    const response = await handler(context);
    expect(response.status).toBe(401);

    const responseBody = await response.json();
    expect(responseBody.error).toBe("Unauthorized");
  });

  test("Should return 405 for non-POST requests", async () => {
    const context = mockContext({}, "GET");

    const response = await handler(context);
    expect(response.status).toBe(405);
  });

  test("Should ignore non-user events", async () => {
    const webhookPayload = {
      time: Date.now(),
      type: "OTHER_EVENT",
      realmId: "jitsi",
      representation: {},
      operationType: "UPDATE",
      resourcePath: "/other",
      resourceType: "OTHER",
    };

    const context = mockContext(webhookPayload);
    const response = await handler(context);

    expect(response.status).toBe(200);
    const responseBody = await response.json();
    expect(responseBody.message).toContain("Ignored");
  });

  test("Should return 400 if user data is invalid", async () => {
    const webhookPayload = createWebhookPayload({
      // Missing email
      id: "user-123",
      firstName: "John",
      lastName: "Doe",
    });

    const context = mockContext(webhookPayload);
    const response = await handler(context);

    expect(response.status).toBe(400);
    const responseBody = await response.json();
    expect(responseBody.error).toContain("Invalid user data");
  });

  test("Should update Paddle customer when name changes", async () => {
    // Mock Paddle fetchCustomer to return existing customer
    PaddleClient.fetchCustomer = mock(async () => ({
      id: "cus_123",
      email: "john@example.com",
      name: "Old Name", // Different from the new name
      status: "active",
      marketing_consent: false,
      locale: "en",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      custom_data: null,
      import_meta: null,
    }));

    // Mock Paddle updateCustomer
    PaddleClient.updateCustomer = mock(async () => ({
      id: "cus_123",
      email: "john@example.com",
      name: "John Doe", // Updated name
      status: "active",
      marketing_consent: false,
      locale: "en",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      custom_data: null,
      import_meta: null,
    }));

    // Mock Brevo getContact to return existing contact
    BrevoClient.getContact = mock(async () => ({
      id: 456,
      email: "john@example.com",
      attributes: {
        FIRSTNAME: "Old",
        LASTNAME: "Name",
      },
    }));

    // Mock Brevo updateContact
    BrevoClient.updateContact = mock(async () => {});

    const userData: Partial<KeycloakUser> = {
      id: "user-123",
      email: "john@example.com",
      firstName: "John",
      lastName: "Doe",
      emailVerified: true,
      attributes: {
        paddle_customer_id: ["cus_123"],
      },
    };

    const webhookPayload = createWebhookPayload(userData);
    const context = mockContext(webhookPayload);
    const response = await handler(context);

    expect(response.status).toBe(200);
    const responseBody = await response.json();
    expect(responseBody.success).toBe(true);

    // Verify both clients were called
    expect(PaddleClient.fetchCustomer).toHaveBeenCalled();
    expect(PaddleClient.updateCustomer).toHaveBeenCalled();
    expect(BrevoClient.getContact).toHaveBeenCalled();
    expect(BrevoClient.updateContact).toHaveBeenCalled();
  });

  test("Should update Brevo contact when email is verified", async () => {
    // Create a mock of updateCustomer that won't be called
    const updateCustomerMock = mock(async () => ({
      id: "cus_456",
      email: "jane@example.com",
      name: "Jane Smith",
      status: "active",
      marketing_consent: false,
      locale: "en",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      custom_data: null,
      import_meta: null,
    }));

    // Mock Paddle fetchCustomer - no need to update as name is the same
    PaddleClient.fetchCustomer = mock(async () => ({
      id: "cus_456",
      email: "jane@example.com",
      name: "Jane Smith", // Same name as in the event
      status: "active",
      marketing_consent: false,
      locale: "en",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      custom_data: null,
      import_meta: null,
    }));

    // Set the update customer mock
    PaddleClient.updateCustomer = updateCustomerMock;

    // Mock Brevo getContact to return existing contact with email not verified
    BrevoClient.getContact = mock(async () => ({
      id: 789,
      email: "jane@example.com",
      attributes: {
        FIRSTNAME: "Jane",
        LASTNAME: "Smith",
        "DOUBLE_OPT-IN": false, // Email was not verified before
      },
    }));

    // Mock Brevo updateContact
    BrevoClient.updateContact = mock(async () => {});

    const userData: Partial<KeycloakUser> = {
      id: "user-456",
      email: "jane@example.com",
      firstName: "Jane",
      lastName: "Smith",
      emailVerified: true, // Email is now verified
      attributes: {
        paddle_customer_id: ["cus_456"],
      },
    };

    const webhookPayload = createWebhookPayload(userData);
    const context = mockContext(webhookPayload);
    const response = await handler(context);

    expect(response.status).toBe(200);
    const responseBody = await response.json();
    expect(responseBody.success).toBe(true);

    // Verify Brevo was called to update email verification
    expect(BrevoClient.getContact).toHaveBeenCalled();
    expect(BrevoClient.updateContact).toHaveBeenCalled();
    // Paddle fetch should be called but not update since name didn't change
    expect(PaddleClient.fetchCustomer).toHaveBeenCalled();
    expect(updateCustomerMock).not.toHaveBeenCalled();
  });

  test("Should create new Brevo contact if not found", async () => {
    // Mock Paddle fetchCustomer
    PaddleClient.fetchCustomer = mock(async () => ({
      id: "cus_789",
      email: "new@example.com",
      name: "New User",
      status: "active",
      marketing_consent: false,
      locale: "en",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      custom_data: null,
      import_meta: null,
    }));

    // Mock Brevo getContact to throw error (contact not found)
    BrevoClient.getContact = mock(async () => {
      throw new Error("Contact not found");
    });

    // Mock Brevo createContact
    BrevoClient.createContact = mock(async () => ({
      id: 999,
    }));

    const userData: Partial<KeycloakUser> = {
      id: "user-789",
      email: "new@example.com",
      firstName: "New",
      lastName: "User",
      emailVerified: true,
      attributes: {
        paddle_customer_id: ["cus_789"],
      },
    };

    const webhookPayload = createWebhookPayload(userData);
    const context = mockContext(webhookPayload);
    const response = await handler(context);

    expect(response.status).toBe(200);
    const responseBody = await response.json();
    expect(responseBody.success).toBe(true);

    // Verify Brevo create was called
    expect(BrevoClient.getContact).toHaveBeenCalled();
    expect(BrevoClient.createContact).toHaveBeenCalled();
  });

  test("Should handle errors gracefully", async () => {
    // Mock Paddle fetchCustomer to throw error
    PaddleClient.fetchCustomer = mock(async () => {
      throw new Error("Paddle error");
    });

    // Mock Brevo getContact to throw error
    BrevoClient.getContact = mock(async () => {
      throw new Error("Brevo error");
    });

    // Mock Brevo createContact to throw error
    BrevoClient.createContact = mock(async () => {
      throw new Error("Brevo create error");
    });

    const userData: Partial<KeycloakUser> = {
      id: "user-error",
      email: "error@example.com",
      firstName: "Error",
      lastName: "Test",
      emailVerified: true,
      attributes: {
        paddle_customer_id: ["cus_error"],
      },
    };

    const webhookPayload = createWebhookPayload(userData);
    const context = mockContext(webhookPayload);
    const response = await handler(context);

    expect(response.status).toBe(207); // Partial success
    const responseBody = await response.json();
    expect(responseBody.errors).toBeDefined();
    expect(responseBody.errors.length).toBeGreaterThan(0);
  });
});
