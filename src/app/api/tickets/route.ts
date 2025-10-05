import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/auth-server';
import { fetchAllUserTickets } from '@/lib/fint';

/**
 * GET /api/tickets
 *
 * Fetches all tickets for the authenticated user
 * Combines purchases (as buyer) and individual tickets (as attendee)
 */
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error('Auth error:', authError);
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch tickets from Fint API
    const tickets = await fetchAllUserTickets(user.email!);

    return NextResponse.json({
      success: true,
      tickets,
      count: tickets.length,
    });
  } catch (error) {
    console.error('Error fetching tickets:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch tickets',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
