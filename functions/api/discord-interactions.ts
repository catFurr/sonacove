import { PagesFunction } from '@cloudflare/workers-types';
import nacl from 'tweetnacl';

// Your Discord application's public key
const PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY;
// Brevo API key
const BREVO_API_KEY = process.env.BREVO_API_KEY;
// Early Access list ID in Brevo
const EARLY_ACCESS_LIST_ID = 5;

interface DiscordInteraction {
  type: number;
  data?: {
    custom_id?: string;
  };
  message?: {
    id: string;
    content: string;
    channel_id: string;
  };
}

export const onRequest: PagesFunction = async (context) => {
  const { request } = context;
  
  try {
    // Only handle POST requests
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }
    
    // Get the signature and timestamp from the headers
    const signature = request.headers.get('X-Signature-Ed25519');
    const timestamp = request.headers.get('X-Signature-Timestamp');
    
    // If either header is missing, return a 401
    if (!signature || !timestamp) {
      return new Response('Missing request signature', { status: 401 });
    }
    
    // Get the raw body as text
    const body = await request.text();
    
    // Verify the signature
    const isVerified = nacl.sign.detached.verify(
      new TextEncoder().encode(timestamp + body),
      hexToUint8Array(signature),
      hexToUint8Array(PUBLIC_KEY || '')
    );
    
    // If the signature is invalid, return a 401
    if (!isVerified) {
      return new Response('Invalid request signature', { status: 401 });
    }
    
    // Parse the body as JSON
    const interaction = JSON.parse(body) as DiscordInteraction;
    
    // Always respond with PONG (type: 1) for all interactions
    // This acknowledges the interaction to Discord
    const pongResponse = new Response(JSON.stringify({ type: 1 }), {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // If this is a component interaction (button click)
    if (interaction.type === 3 && 
        interaction.data?.custom_id === 'approve_contact' &&
        interaction.message) {
      
      // Extract the email from the original message content
      const messageContent = interaction.message.content;
      const emailMatch = messageContent.match(/email: ([^\s]+)/);
      
      if (emailMatch && emailMatch[1]) {
        const email = emailMatch[1];
        
        // Process in the background so we can return PONG immediately
        context.waitUntil(
          addContactToBrevoList(email, EARLY_ACCESS_LIST_ID)
            .then(() => {
              console.log(`Successfully added ${email} to Early Access list`);
              
              // Update the original message to indicate approval
              return updateDiscordMessage(
                interaction.message!.id, 
                interaction.message!.channel_id, 
                `${messageContent}\n\n✅ Approved and added to Early Access list`
              );
            })
            .catch(error => {
              console.error(`Error adding contact to Brevo list: ${error}`);
              
              // Update the original message to indicate failure
              return updateDiscordMessage(
                interaction.message!.id,
                interaction.message!.channel_id,
                `${messageContent}\n\n❌ Failed to add to Early Access list: ${error.message}`
              );
            })
        );
      }
    }
    
    // Return PONG response immediately
    return pongResponse;
    
  } catch (error) {
    console.error('Error handling Discord interaction:', error);
    return new Response('Internal server error', { status: 500 });
  }
}

/**
 * Convert a hex string to Uint8Array
 */
function hexToUint8Array(hex: string): Uint8Array {
  return new Uint8Array(
    hex.match(/.{1,2}/g)?.map(byte => parseInt(byte, 16)) || []
  );
}

/**
 * Add a contact to a specific list in Brevo
 */
async function addContactToBrevoList(email: string, listId: number) {
  const response = await fetch('https://api.brevo.com/v3/contacts/lists/' + listId + '/contacts/add', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'api-key': BREVO_API_KEY || ''
    },
    body: JSON.stringify({
      emails: [email]
    })
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error((errorData as any).message || 'Failed to add contact to list');
  }
  
  return response.json();
}

/**
 * Update a Discord message
 */
async function updateDiscordMessage(messageId: string, channelId: string, content: string) {
  const DISCORD_BOT_TOKEN = process.env.DISCORD_BOT_TOKEN;
  
  const response = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages/${messageId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bot ${DISCORD_BOT_TOKEN || ''}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      content: content,
      components: [] // Remove the button after approval
    })
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error((errorData as any).message || 'Failed to update Discord message');
  }
} 