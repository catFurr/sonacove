import { PUBLIC_BREVO_WEBHOOK_URL } from "astro:env/client";


/**
 * Utility function to add a contact to Brevo (formerly Sendinblue) via webhook
 * @param email - The email address to add
 * @param source - The source of the signup (e.g., 'website_hero', 'website_cta')
 * @returns Promise that resolves to the API response
 */
export async function addContactToBrevo(email: string, source: string): Promise<any> {
  try {
    // Get webhook URL from environment variables
    const webhookUrl = PUBLIC_BREVO_WEBHOOK_URL;
    
    if (!webhookUrl) {
      console.error('Brevo webhook URL is not configured');
      throw new Error('Webhook URL not configured');
    }
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        source: source
      })
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    // Check the content type of the response
    const contentType = response.headers.get('content-type');
    
    // If it's JSON, parse it; otherwise, return the text
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else {
      // For text responses like "Accepted", just return an object with a success flag
      const text = await response.text();
      return { success: true, message: text };
    }
  } catch (error) {
    console.error('Error adding contact to Brevo:', error);
    throw error;
  }
}

/**
 * Shows a success message after email submission
 * @param element - The element to replace with the success message
 * @param isCompact - Whether to use a compact success message (for inline forms)
 */
export function showSuccessMessage(element: HTMLElement, isCompact: boolean = false): void {
  if (isCompact) {
    element.innerHTML = `
      <div class="bg-green-50 border border-green-200 rounded-lg p-4">
        <p class="text-green-800 font-medium">Thank you for joining our waitlist!</p>
        <p class="text-green-700 text-sm">We'll keep you updated on our progress.</p>
      </div>
    `;
  } else {
    element.innerHTML = `
      <div class="text-center py-6">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-green-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 class="text-xl font-bold text-gray-800 mb-2">Thank you for joining our waitlist!</h3>
        <p class="text-gray-600">We'll keep you updated on our progress.</p>
      </div>
    `;
  }
}

/**
 * Shows an error message after failed email submission
 * @param element - The element to append the error message to
 */
export function showErrorMessage(element: HTMLElement): void {
  // Remove any existing error messages first
  const existingErrors = document.querySelectorAll('.brevo-error-message');
  existingErrors.forEach(el => el.remove());
  
  // Create a container for the error message
  const errorContainer = document.createElement('div');
  errorContainer.className = 'mt-2 w-full brevo-error-message';
  
  // Create the error message
  const errorMessage = document.createElement('p');
  errorMessage.className = 'text-red-500 text-sm text-center';
  errorMessage.textContent = 'There was an error. Please try again.';
  
  // Append the error message to the container
  errorContainer.appendChild(errorMessage);
  
  // For the hero form, we need to handle the layout differently
  if (element.id === 'hero-waitlist-form') {
    // Find the parent container that holds the form
    const formContainer = element.parentElement;
    if (formContainer) {
      formContainer.appendChild(errorContainer);
    } else {
      // Fallback if parent not found
      element.insertAdjacentElement('afterend', errorContainer);
    }
  } else {
    // For other forms, just append after the form
    element.insertAdjacentElement('afterend', errorContainer);
  }
}