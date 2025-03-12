import type { APIRoute } from "astro";
import nacl from "tweetnacl";

// Your Discord application's public key
const PUBLIC_KEY = import.meta.env.DISCORD_PUBLIC_KEY;
// Brevo API key
const BREVO_API_KEY = import.meta.env.BREVO_API_KEY;
// Early Access list ID in Brevo
const EARLY_ACCESS_LIST_ID = 5;

export const POST: APIRoute = async ({ request }) => {
  try {
    // Get the signature and timestamp from the headers
    const signature = request.headers.get("X-Signature-Ed25519");
    const timestamp = request.headers.get("X-Signature-Timestamp");

    // If either header is missing, return a 401
    if (!signature || !timestamp) {
      return new Response("Missing request signature", { status: 401 });
    }

    // Get the raw body as text
    const body = await request.text();

    // Verify the signature
    const isVerified = nacl.sign.detached.verify(
      Buffer.from(timestamp + body),
      Buffer.from(signature, "hex"),
      Buffer.from(PUBLIC_KEY, "hex")
    );

    // If the signature is invalid, return a 401
    if (!isVerified) {
      return new Response("Invalid request signature", { status: 401 });
    }

    // Parse the body as JSON
    const interaction = JSON.parse(body);

    // Always respond with PONG (type: 1) for all interactions
    // This acknowledges the interaction to Discord
    const pongResponse = new Response(JSON.stringify({ type: 1 }), {
      headers: {
        "Content-Type": "application/json"
      }
    });

    // If this is a component interaction (button click)
    if (interaction.type === 3 && 
        interaction.data.custom_id === 'approve_contact') {
      
      // Extract the email from the original message content
      const messageContent = interaction.message.content;
      const emailMatch = messageContent.match(/email: ([^\s]+)/);
      
      if (emailMatch && emailMatch[1]) {
        const email = emailMatch[1];
        
        // Process in the background so we can return PONG immediately
        addContactToBrevoList(email, EARLY_ACCESS_LIST_ID)
          .then(() => {
            console.log(`Successfully added ${email} to Early Access list`);
            
            // Update the original message to indicate approval
            updateDiscordMessage(
              interaction.message.id, 
              interaction.channel_id, 
              `${messageContent}\n\n✅ Approved and added to Early Access list`
            );
          })
          .catch(error => {
            console.error(`Error adding contact to Brevo list: ${error}`);
            
            // Update the original message to indicate failure
            updateDiscordMessage(
              interaction.message.id,
              interaction.channel_id,
              `${messageContent}\n\n❌ Failed to add to Early Access list: ${error.message}`
            );
          });
      }
    }
    
    // Return PONG response immediately
    return pongResponse;
    
  } catch (error) {
    console.error("Error handling Discord interaction:", error);
    return new Response("Internal server error", { status: 500 });
  }
};

/**
 * Add a contact to a specific list in Brevo
 */
async function addContactToBrevoList(email: string, listId: number): Promise<void> {
  const response = await fetch("https://api.brevo.com/v3/contacts/lists/" + listId + "/contacts/add", {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "api-key": BREVO_API_KEY
    },
    body: JSON.stringify({
      emails: [email]
    })
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to add contact to list");
  }
  
  return response.json();
}

/**
 * Update a Discord message
 */
async function updateDiscordMessage(messageId: string, channelId: string, content: string): Promise<void> {
  const DISCORD_BOT_TOKEN = import.meta.env.DISCORD_BOT_TOKEN;
  
  const response = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages/${messageId}`, {
    method: "PATCH",
    headers: {
      "Authorization": `Bot ${DISCORD_BOT_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      content: content,
      components: [] // Remove the button after approval
    })
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to update Discord message");
  }
}
