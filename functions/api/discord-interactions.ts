import { KVNamespace, PagesFunction } from '@cloudflare/workers-types';
import nacl from 'tweetnacl';
import { BrevoClient } from '../components/brevo.js';

// Early Access list ID in Brevo
const EARLY_ACCESS_LIST_ID = 5;

export interface Env {
    DISCORD_PUBLIC_KEY: string;
    BREVO_API_KEY: string;
    DISCORD_BOT_TOKEN: string;
    KV: KVNamespace;
}

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

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  
  // Update PUBLIC_KEY and BREVO_API_KEY with context.env values
  const publicKey = env.DISCORD_PUBLIC_KEY || '';
  const discordBotToken = env.DISCORD_BOT_TOKEN || '';
  
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
      hexToUint8Array(publicKey)
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
          BrevoClient.addContactToList(email, EARLY_ACCESS_LIST_ID, env.BREVO_API_KEY)
            .then(() => {
              console.log(`Successfully added ${email} to Early Access list`);

              // Update the original message to indicate approval
              return updateDiscordMessage(
                interaction.message!.id, 
                interaction.message!.channel_id, 
                `${messageContent}\n\n✅ Approved and added to Early Access list`,
                discordBotToken
              );
            })
            .catch(error => {
              console.error(`Error adding contact to Brevo list: ${error}`);
              
              // Update the original message to indicate failure
              return updateDiscordMessage(
                interaction.message!.id,
                interaction.message!.channel_id,
                `${messageContent}\n\n❌ Failed to add to Early Access list: ${error.message}`,
                discordBotToken
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
 * Update a Discord message
 */
async function updateDiscordMessage(messageId: string, channelId: string, content: string, botToken: string) {
  const response = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages/${messageId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bot ${botToken}`,
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