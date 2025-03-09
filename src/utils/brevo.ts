/**
 * Utility function to add a contact to Brevo (formerly Sendinblue) via webhook
 * @param email - The email address to add
 * @param source - The source of the signup (e.g., 'website_hero', 'website_cta')
 * @returns Promise that resolves to the API response
 */
export async function addContactToBrevo(email: string, source: string): Promise<any> {
  try {
    // Get webhook URL from environment variables
    const webhookUrl = import.meta.env.BREVO_WEBHOOK_URL;
    
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

    return await response.json();
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
  const existingErrors = element.querySelectorAll('.brevo-error-message');
  existingErrors.forEach(el => el.remove());
  
  const errorMessage = document.createElement('p');
  errorMessage.className = 'text-red-500 text-sm mt-2 brevo-error-message';
  errorMessage.textContent = 'There was an error. Please try again.';
  element.appendChild(errorMessage);
}