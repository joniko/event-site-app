import { NextRequest, NextResponse } from 'next/server';
import { updateTicketByReference } from '@/lib/fint';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PUT(
  request: NextRequest,
  { params }: { params: { reference: string } }
) {
  try {
    // Verify authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { firstName, lastName, email, document, status, customFieldResponses } = body;

    // Validate at least one field is provided
    if (!firstName && !lastName && !email && !document && !status && !customFieldResponses) {
      return NextResponse.json(
        { error: 'At least one field must be provided' },
        { status: 400 }
      );
    }

    // Update ticket via Fint API
    const updatedTicket = await updateTicketByReference(params.reference, {
      firstName,
      lastName,
      email,
      document,
      status,
      customFieldResponses,
    });

    return NextResponse.json({
      success: true,
      ticket: updatedTicket,
    });
  } catch (error) {
    console.error('Error updating ticket:', error);
    return NextResponse.json(
      {
        error: 'Failed to update ticket',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
