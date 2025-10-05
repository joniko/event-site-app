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

// Types for Purchase endpoint
// https://docs.fint.app/api-reference/eventos/buscar-compras-por-email-del-comprador
export interface FintPurchase {
  id: number;
  reference: string;
  buyerFirstName: string;
  buyerLastName: string;
  buyerDocument: string;
  buyerEmail: string;
  buyerPhone: string;
  totalAmount: string;
  createdAt: string;
  pdfUrl: string;
  organizationId: number;
  eventPageId: number;
  eventPage: {
    id: number;
    name: string;
    reference: string;
  };
  attendees: Array<{
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
    askInformation: boolean;
    isAdditional: boolean;
  }>;
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
  document: string | null;
  amount: string;
  reference: string;
  itemName?: string;
  purchaseReference?: string;
  buyerEmail?: string;
}

/**
 * Map Fint API response to our internal Ticket type
 */
export const mapToTicket = (fintTicket: FintTicket): Omit<Ticket, 'id'> => ({
  externalId: fintTicket.id.toString(),
  status: fintTicket.status,
  qrUrl: fintTicket.qrUrl || null,
  pdfUrl: fintTicket.pdfUrl || null,
  eventName: fintTicket.purchase?.eventPage?.name || fintTicket.itemName || 'Evento sin nombre',
  purchasedAt: new Date(fintTicket.purchase?.createdAt || Date.now()),
  userEmail: fintTicket.email,
  firstName: fintTicket.firstName || null,
  lastName: fintTicket.lastName || null,
  document: fintTicket.document || null,
  amount: fintTicket.amount,
  reference: fintTicket.reference,
  itemName: fintTicket.itemName,
  purchaseReference: fintTicket.purchase?.reference,
  buyerEmail: fintTicket.purchase?.buyerEmail,
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
  retries = 3,
  noCache = false
): Promise<Omit<Ticket, 'id'>[]> {
  const url = `${process.env.FINT_API_BASE_URL}/event/ticket/email/${encodeURIComponent(email)}`;

  try {
    const response = await fetch(url, {
      headers: {
        'x-api-key': process.env.FINT_API_KEY!,
      },
      ...(noCache ? { cache: 'no-store' } : { next: { revalidate: 300 } }), // Cache for 5 minutes or no cache
    });

    // Handle rate limiting with retry
    if (response.status === 429 && retries > 0) {
      const backoffDelay = 2000 * (4 - retries); // 2s, 4s, 6s
      console.warn(`Fint API rate limit hit. Retrying in ${backoffDelay}ms...`);
      
      await new Promise((resolve) => setTimeout(resolve, backoffDelay));
      return fetchTicketsByEmail(email, retries - 1, noCache);
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
 * Fetch purchases by buyer email from Fint API
 *
 * @param email - Buyer email to search purchases
 * @param retries - Number of retries on rate limit (default: 3)
 * @returns Array of purchases with attendees
 */
export async function fetchPurchasesByEmail(
  email: string,
  retries = 3,
  noCache = false
): Promise<FintPurchase[]> {
  const url = `${process.env.FINT_API_BASE_URL}/event/purchase/email/${encodeURIComponent(email)}`;

  try {
    const response = await fetch(url, {
      headers: {
        'x-api-key': process.env.FINT_API_KEY!,
      },
      ...(noCache ? { cache: 'no-store' } : { next: { revalidate: 300 } }), // Cache for 5 minutes or no cache
    });

    // Handle rate limiting with retry
    if (response.status === 429 && retries > 0) {
      const backoffDelay = 2000 * (4 - retries);
      console.warn(`Fint API rate limit hit. Retrying in ${backoffDelay}ms...`);

      await new Promise((resolve) => setTimeout(resolve, backoffDelay));
      return fetchPurchasesByEmail(email, retries - 1, noCache);
    }

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(
        `Fint API error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const data: FintPurchase[] = await response.json();
    return data;
  } catch (error) {
    console.error('Fint purchase fetch error:', {
      email,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
}

/**
 * Fetch all tickets for a user (as buyer or attendee)
 * Combines purchases (where user is buyer) and tickets (where user is attendee)
 *
 * @param email - User email
 * @returns Unified array of tickets with purchase info
 */
export async function fetchAllUserTickets(email: string, noCache = false): Promise<Omit<Ticket, 'id'>[]> {
  try {
    // Fetch both in parallel
    const [purchases, individualTickets] = await Promise.all([
      fetchPurchasesByEmail(email, 3, noCache),
      fetchTicketsByEmail(email, 3, noCache),
    ]);

    const allTickets: Omit<Ticket, 'id'>[] = [];
    const seenTicketIds = new Set<number>();

    // Process purchases first (user as buyer)
    for (const purchase of purchases) {
      for (const attendee of purchase.attendees) {
        if (!seenTicketIds.has(attendee.id)) {
          seenTicketIds.add(attendee.id);
          allTickets.push({
            externalId: attendee.id.toString(),
            status: attendee.status,
            qrUrl: attendee.qrUrl || null,
            pdfUrl: attendee.pdfUrl || null,
            eventName: purchase.eventPage?.name || attendee.itemName || 'Evento sin nombre',
            purchasedAt: new Date(purchase.createdAt),
            userEmail: attendee.email,
            firstName: attendee.firstName || null,
            lastName: attendee.lastName || null,
            document: attendee.document || null,
            amount: attendee.amount,
            reference: attendee.reference,
            itemName: attendee.itemName,
            purchaseReference: purchase.reference,
            buyerEmail: purchase.buyerEmail,
          });
        }
      }
    }

    // Add individual tickets (where user is attendee but not buyer)
    for (const ticket of individualTickets) {
      const ticketId = parseInt(ticket.externalId);
      if (!seenTicketIds.has(ticketId)) {
        allTickets.push(ticket);
      }
    }

    return allTickets;
  } catch (error) {
    console.error('Error fetching all user tickets:', error);
    throw error;
  }
}

/**
 * Update ticket data by reference
 * 
 * @param reference - Ticket reference
 * @param data - Data to update (firstName, lastName, email, document, status)
 * @returns Updated ticket data
 */
export async function updateTicketByReference(
  reference: string,
  data: {
    firstName?: string;
    lastName?: string;
    email?: string;
    document?: string;
    status?: 'ADMITTED' | 'PENDING' | 'REJECTED';
    customFieldResponses?: Array<{
      id?: number;
      customFieldId: number;
      value: string;
    }>;
  }
): Promise<any> {
  const url = `${process.env.FINT_API_BASE_URL}/event/ticket/reference/${encodeURIComponent(reference)}`;

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'x-api-key': process.env.FINT_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new FintAPIError(
        response.status,
        `Failed to update ticket: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Fint update ticket error:', {
      reference,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    throw error;
  }
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
