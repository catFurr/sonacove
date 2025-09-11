import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import {
  BrevoClient,
  type BrevoContactAttributes,
} from "../src/lib/modules/brevo";

// Test email constant - easy to update in one place
const TEST_EMAIL = "mohammedbinahsan@gmail.com";

describe("BrevoClient", () => {
  const apiKey = process.env.BREVO_API_KEY || "";
  // Track created contacts for cleanup
  const createdContactEmails: string[] = [];
  const createdContactIds: number[] = [];

  beforeAll(() => {
    if (!apiKey) {
      throw new Error("BREVO_API_KEY environment variable is not set");
    }
  });

  // Clean up created test contacts
  afterAll(async () => {
    console.log(`Cleaning up ${createdContactEmails.length} test contacts...`);

    // Clean up by email
    for (const email of createdContactEmails) {
      try {
        console.log(`Attempting to clean up test contact: ${email}`);
        await BrevoClient.deleteContact(email);
      } catch (error) {
        console.error(`Failed to clean up contact ${email}:`, error);
      }
    }

    // Clean up by ID
    for (const id of createdContactIds) {
      try {
        console.log(`Attempting to clean up test contact ID: ${id}`);
        await BrevoClient.deleteContact(id, true);
      } catch (error) {
        console.error(`Failed to clean up contact ID ${id}:`, error);
      }
    }
  });

  const testAttributes: BrevoContactAttributes = {
    FIRSTNAME: "Test",
    LASTNAME: "User",
    OPT_IN: true,
    // Note: DOUBLE_OPT-IN may not be returned by the API as observed
    "DOUBLE_OPT-IN": true,
    JOB_TITLE: "Developer",
  };

  test("getContact should fetch an existing contact", async () => {
    const contact = await BrevoClient.getContact(TEST_EMAIL);
    expect(contact).toBeDefined();
    expect(contact.email).toBe(TEST_EMAIL);
  });

  test("createContact should create a new contact with specified attributes", async () => {
    // Generate random email to avoid conflicts
    const randomEmail = `test-${Date.now()}@example.com`;
    // Track for cleanup
    createdContactEmails.push(randomEmail);

    const result = await BrevoClient.createContact(
      randomEmail,
      testAttributes,
      2, // default list ID
    );

    // Track ID for cleanup
    if (result && result.id) {
      createdContactIds.push(result.id);
    }

    // The API returns an object with id, but not email
    expect(result).toBeDefined();
    expect(result.id).toBeDefined();

    // Verify the contact was created by fetching it
    const fetchedContact = await BrevoClient.getContact(randomEmail);

    expect(fetchedContact).toBeDefined();
    expect(fetchedContact.email).toBe(randomEmail);

    // Check attributes that were confirmed to be set
    expect(fetchedContact.attributes?.FIRSTNAME).toBe(
      testAttributes.FIRSTNAME || ""
    );
    expect(fetchedContact.attributes?.LASTNAME).toBe(
      testAttributes.LASTNAME || ""
    );
    expect(fetchedContact.attributes?.JOB_TITLE).toBe(
      testAttributes.JOB_TITLE || ""
    );
    expect(fetchedContact.attributes?.OPT_IN).toBe(
      testAttributes.OPT_IN || false
    );

    // Note: DOUBLE_OPT-IN might not be returned by the API as observed in previous runs
  });

  test("updateContact should update an existing contact", async () => {
    // First, get the test contact
    const contact = await BrevoClient.getContact(TEST_EMAIL);

    // Store original values to restore later
    const originalJobTitle = contact.attributes?.JOB_TITLE;
    const originalLastName = contact.attributes?.LASTNAME;

    // Prepare updates with a timestamp to make it unique
    const timestamp = Date.now();
    const updates = {
      attributes: {
        JOB_TITLE: `Tester ${timestamp}`,
        LASTNAME: `Updated ${timestamp}`,
      },
    };

    // Update the contact
    await BrevoClient.updateContact(TEST_EMAIL, updates);

    // Fetch the contact again to verify updates
    const updatedContact = await BrevoClient.getContact(TEST_EMAIL);

    expect(updatedContact.attributes?.JOB_TITLE).toBe(
      updates.attributes.JOB_TITLE
    );
    expect(updatedContact.attributes?.LASTNAME).toBe(
      updates.attributes.LASTNAME
    );

    // Restore original values
    await BrevoClient.updateContact(
      TEST_EMAIL,
      {
        attributes: {
          JOB_TITLE: originalJobTitle || "",
          LASTNAME: originalLastName || "",
        },
      },
    );
  });

  test("addContactToList should add a contact to a specified list", async () => {
    // Generate random email
    const randomEmail = `test-list-${Date.now()}@example.com`;
    // Track for cleanup
    createdContactEmails.push(randomEmail);

    // Create a new contact
    const newContact = await BrevoClient.createContact(
      randomEmail,
      testAttributes,
      2, // default list ID
    );

    // Track ID for cleanup
    if (newContact && newContact.id) {
      createdContactIds.push(newContact.id);
    }

    // Add to list 3 (different from default)
    const listId = 3; // Use a different list ID than the default for testing
    const result = await BrevoClient.addContactToList(
      randomEmail,
      listId,
    );

    expect(result).toBeDefined();
  });
});
