import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { approveFollowUp, sendFollowUp } from '@/lib/automation';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    let query = supabase
      .from('follow_ups')
      .select(`
        *,
        leads(*)
      `)
      .order('scheduled_at', { ascending: true });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: followUps, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch follow-ups' },
        { status: 500 }
      );
    }

    // Transform the data to match frontend expectations
    const transformedFollowUps = followUps?.map(followUp => ({
      id: followUp.id,
      type: followUp.type,
      scheduledAt: followUp.scheduled_at,
      completedAt: followUp.completed_at,
      status: followUp.status,
      message: followUp.message,
      approved: followUp.approved,
      approvedBy: followUp.approved_by,
      approvedAt: followUp.approved_at,
      createdAt: followUp.created_at,
      lead: followUp.leads ? {
        id: followUp.leads.id,
        name: followUp.leads.name,
        email: followUp.leads.email,
        phone: followUp.leads.phone,
        company: followUp.leads.company,
        productInterest: followUp.leads.product_interest,
        message: followUp.leads.message,
        category: followUp.leads.category,
      } : null,
    })) || [];

    return NextResponse.json(transformedFollowUps);
  } catch (error) {
    console.error('Error fetching follow-ups:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { followUpId, action, approvedBy } = body;

    if (action === 'approve') {
      await approveFollowUp(followUpId, approvedBy || 'admin');
      
      // Optionally send immediately after approval
      if (body.sendImmediately) {
        await sendFollowUp(followUpId);
      }

      return NextResponse.json({ success: true });
    }

    if (action === 'send') {
      await sendFollowUp(followUpId);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error processing follow-up:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
