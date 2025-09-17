import { getLogger } from "../../lib/modules/pino-logger";
import { BREVO_API_KEY } from "astro:env/server";

const logger = getLogger();

const apiEndpoint = "https://api.brevo.com/v3/contacts/";

// Define types for Brevo contact attributes
export interface BrevoContactAttributes {
  LASTNAME?: string;
  FIRSTNAME?: string;
  SMS?: string;
  EXT_ID?: string;
  WHATSAPP?: string;
  EMAIL?: string;
  "CONTACT OWNER"?: string;
  "DOUBLE_OPT-IN"?: boolean;
  OPT_IN?: boolean;
  CONTACT_TIMEZONE?: string;
  JOB_TITLE?: string;
  LINKEDIN?: string;
  [key: string]: any;
}

export interface BrevoContact {
  email: string;
  id?: number;
  attributes?: BrevoContactAttributes;
  listIds?: number[];
  emailBlacklisted?: boolean;
  smsBlacklisted?: boolean;
  createdAt?: string;
  modifiedAt?: string;
}

// Response when creating a contact
export interface BrevoCreateContactResponse {
  id: number;
}

/**
 * Creates a new contact in Brevo
 */
async function createContact(
  email: string,
  attributes: BrevoContactAttributes = {},
  listId: number = 2
): Promise<BrevoCreateContactResponse> {
  const response = await fetch(apiEndpoint, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "api-key": BREVO_API_KEY,
    },
    body: JSON.stringify({
      email,
      attributes,
      listIds: [listId],
      updateEnabled: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `Failed to create contact: ${response.status} ${response.statusText}`;
    try {
      const errorData = JSON.parse(errorText);
      if (errorData && errorData.message) {
        errorMessage = errorData.message;
      }
    } catch (e) {
      // If JSON parsing fails, use the error text as is
      if (errorText) {
        errorMessage += ` - ${errorText}`;
      }
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Updates an existing contact in Brevo by email or external ID
 */
async function updateContact(
  identifier: string,
  updates: Partial<BrevoContact> & { attributes?: BrevoContactAttributes },
  useExtId: boolean = false
): Promise<void> {
  let endpoint = apiEndpoint;

  if (useExtId && updates.attributes?.EXT_ID) {
    // If using external ID for identification
    endpoint += `ext/${identifier}`;
  } else {
    // Default to using email
    endpoint += identifier;
  }

  const response = await fetch(endpoint, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "api-key": BREVO_API_KEY,
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `Failed to update contact: ${response.status} ${response.statusText}`;
    try {
      const errorData = JSON.parse(errorText);
      if (errorData && errorData.message) {
        errorMessage = errorData.message;
      }
    } catch (e) {
      // If JSON parsing fails, use the error text as is
      if (errorText) {
        errorMessage += ` - ${errorText}`;
      }
    }
    throw new Error(errorMessage);
  }
}

/**
 * Gets an existing contact from Brevo by email or external ID
 */
async function getContact(
  identifier: string,
  useExtId: boolean = false
): Promise<BrevoContact> {
  let endpoint = apiEndpoint;

  if (useExtId) {
    // If using external ID for identification
    endpoint += `ext/${identifier}`;
  } else {
    // Default to using email
    endpoint += identifier;
  }

  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "api-key": BREVO_API_KEY,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `Failed to get contact: ${response.status} ${response.statusText}`;
    try {
      const errorData = JSON.parse(errorText);
      if (errorData && errorData.message) {
        errorMessage = errorData.message;
      }
    } catch (e) {
      // If JSON parsing fails, use the error text as is
      if (errorText) {
        errorMessage += ` - ${errorText}`;
      }
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

async function addContactToList(email: string, listId: number) {
  const response = await fetch(
    apiEndpoint + "lists/" + listId + "/contacts/add",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "api-key": BREVO_API_KEY,
      },
      body: JSON.stringify({
        emails: [email],
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `Failed to add contact to list: ${response.status} ${response.statusText}`;
    try {
      const errorData = JSON.parse(errorText);
      if (errorData && errorData.message) {
        errorMessage = errorData.message;
      }
    } catch (e) {
      // If JSON parsing fails, use the error text as is
      if (errorText) {
        errorMessage += ` - ${errorText}`;
      }
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Finds a Brevo contact by email or external ID (Paddle customer ID)
 * @param email The contact's email
 * @param customerId The Paddle customer ID (optional)
 * @returns The contact if found, null otherwise
 */
async function findContactByEmailOrId(email: string, customerId?: string): Promise<BrevoContact | null> {
  // First try to find by email
  try {
    const contact = await getContact(email);
    return contact;
  } catch (emailError) {
    // If not found by email and we have a customer ID, try by customer ID
    if (customerId) {
      try {
        const contact = await getContact(customerId, true); // useExtId = true
        return contact;
      } catch (cidError) {
        // Contact not found by either method
        return null;
      }
    }
    return null;
  }
}

/**
 * Sets a Brevo contact - updates if exists, creates if doesn't exist
 * @param email The contact's email (required)
 * @param attributes Contact attributes to set
 * @param listIds List IDs to add the contact to (optional, defaults to [2])
 * @param paddleCustomerId The Paddle customer ID (optional)
 * @returns Promise<void>
 */
async function setContact(
  email: string,
  attributes: BrevoContactAttributes = {},
  listIds: number[] = [2],
  paddleCustomerId?: string
): Promise<void> {
  try {
    // Skip if we don't have basic info
    if (!email) {
      throw new Error("Email is required to set contact");
    }

    // Add Paddle customer ID to attributes if provided
    if (paddleCustomerId) {
      attributes.EXT_ID = paddleCustomerId;
    }

    // Try to find the contact by email or customer ID
    const existingContact = await findContactByEmailOrId(email, paddleCustomerId);
    const contactFound = existingContact !== null;

    if (contactFound) {
      // Update the existing contact
      await updateContact(email, { attributes });
      logger.info(`Updated Brevo contact for ${email}`);
    } else {
      // Create a new contact with the provided info
      await createContact(email, attributes, listIds[0] || 2);
      logger.info(`Created new Brevo contact for ${email}`);
    }
  } catch (e) {
    logger.error(e, `Error setting Brevo contact for ${email}:`);
    throw e;
  }
}

/**
 * Deletes a contact from Brevo by email or ID
 *
 * FIXME: Will be implemented in the future when needed for test cleanup
 * This is currently just a placeholder that logs the deletion intent but doesn't perform any action
 */
async function deleteContact(
  identifier: string | number,
  isId: boolean = false
): Promise<boolean> {
  // Log the deletion intent
  logger.info(
    `[NOT IMPLEMENTED] Would delete contact: ${identifier} (${
      isId ? "by ID" : "by email"
    })`
  );

  // In the future, this will use DELETE request to Brevo API
  // For now, just return success
  return true;
}

export const BrevoClient = {
  addContactToList,
  createContact,
  updateContact,
  setContact,
  findContactByEmailOrId,
  getContact,
  deleteContact,
};
