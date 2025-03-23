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
  listId: number = 2,
  apiKey: string
): Promise<BrevoCreateContactResponse> {
  const response = await fetch(apiEndpoint, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "api-key": apiKey,
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
  apiKey: string,
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
      "api-key": apiKey,
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
  apiKey: string,
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
      "api-key": apiKey,
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

async function addContactToList(email: string, listId: number, apiKey: string) {
  const response = await fetch(
    apiEndpoint + "lists/" + listId + "/contacts/add",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "api-key": apiKey,
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
 * Deletes a contact from Brevo by email or ID
 *
 * TODO: Will be implemented in the future when needed for test cleanup
 * This is currently just a placeholder that logs the deletion intent but doesn't perform any action
 */
async function deleteContact(
  identifier: string | number,
  apiKey: string,
  isId: boolean = false
): Promise<boolean> {
  // Log the deletion intent
  console.log(
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
  getContact,
  deleteContact,
};
