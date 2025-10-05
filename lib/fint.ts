/**
 * Fint API Client
 * 
 * Integration with Fint API for ticket management.
 * Includes retry logic with exponential backoff for resilience.
 */

// Types based on Fint API documentation
// https://docs.fint.app/api-reference/eventos/buscar-tickets-por-email-del-asistente
export interface FintTicket {
  id: number;
  firstName: string;
  lastName: string;
  document: string;
  email: string;
  status: string;
  amount: string;
  reference: string;
  itemName: string;
  qrUrl: string;
  generateQr: boolean;
  pdfUrl: string;
  purchaseId: number;
  purchase: {
    id: number;
    reference: string;
    buyerFirstName: string;
    buyerLastName: string;
    buyerEmail: string;
    totalAmount: string;
    createdAt: string;
    organizationId: number;
    eventPageId: number;
    eventPage: {
      id: number;
      name: string;
      reference: string;
    };
  };
}

// Our internal Ticket type
export interface Ticket {
  id: string;
  externalId: string;
  status: string;
  qrUrl: string | null;
  pdfUrl: string | null;
  eventName: string;
  purchasedAt: Date;
  userEmail: string;
  firstName: string | null;
  lastName: string | null;
  amount: string;
  reference: string;
}

/**
 * Map Fint API response to our internal Ticket type
 */
export const mapToTicket = (fintTicket: FintTicket): Omit<Ticket, 'id'> => ({
  externalId: fintTicket.id.toString(),
  status: fintTicket.status,
  qrUrl: fintTicket.qrUrl || null,
  pdfUrl: fintTicket.pdfUrl || null,
  eventName: fintTicket.purchase.eventPage.name,
  purchasedAt: new Date(fintTicket.purchase.createdAt),
  userEmail: fintTicket.email,
  firstName: fintTicket.firstName || null,
  lastName: fintTicket.lastName || null,
  amount: fintTicket.amount,
  reference: fintTicket.reference,
});

/**
 * Fetch tickets by email from Fint API
 * 
 * Features:
 * - Automatic retry on rate limit (429) with exponential backoff
 * - Next.js cache for 5 minutes
 * - URL encoding for email safety
 * - Detailed error messages
 * 
 * @param email - User email to search tickets
 * @param retries - Number of retries on rate limit (default: 3)
 * @returns Array of tickets mapped to our internal type
 */
export async function fetchTicketsByEmail(
  email: string,
  retries = 3
): Promise<Omit<Ticket, 'id'>[]> {
  const url = `${process.env.FINT_API_BASE_URL}/event/ticket/email/${encodeURIComponent(email)}`;

  try {
    const response = await fetch(url, {
      headers: {
        'x-api-key': process.env.FINT_API_KEY!,
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    // Handle rate limiting with retry
    if (response.status === 429 && retries > 0) {
      const backoffDelay = 2000 * (4 - retries); // 2s, 4s, 6s
      console.warn(`Fint API rate limit hit. Retrying in ${backoffDelay}ms...`);
      
      await new Promise((resolve) => setTimeout(resolve, backoffDelay));
      return fetchTicketsByEmail(email, retries - 1);
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(
        `Fint API error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const data: FintTicket[] = await response.json();
    return data.map(mapToTicket);
  } catch (error) {
    console.error('Fint fetch error:', {
      email,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

/**
 * Validate Fint webhook signature
 * 
 * @param signature - Signature from webhook header
 * @returns true if signature is valid
 */
export function validateWebhookSignature(signature: string): boolean {
  const secret = process.env.FINT_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error('FINT_WEBHOOK_SECRET not configured');
  }

  // TODO: Implement actual signature validation based on Fint docs
  // This is a placeholder - check Fint documentation for actual implementation
  return signature === secret;
}

/**
 * Error class for Fint API errors
 */
export class FintAPIError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'FintAPIError';
  }
}
