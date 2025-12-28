import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export async function GET() {
  try {
    const { data: approvals, error } = await supabase
      .from('approvals') 
      .select(`
        *,
        leads(*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch approvals' },
        { status: 500 }
      );
    }

    // Transform the data to match frontend expectations
    const transformedApprovals = approvals?.map(approval => ({
      id: approval.id,
      type: approval.type,
      status: approval.status,
      requestedBy: approval.requested_by,
      approvedBy: approval.approved_by,
      approvedAt: approval.approved_at,
      notes: approval.notes,
      metadata: approval.metadata,
      createdAt: approval.created_at,
      lead: approval.leads ? {
        id: approval.leads.id,
        name: approval.leads.name,
        email: approval.leads.email,
        phone: approval.leads.phone,
        company: approval.leads.company,
        productInterest: approval.leads.product_interest,
        category: approval.leads.category,
      } : null,
    })) || [];

    return NextResponse.json(transformedApprovals);
  } catch (error) {
    console.error('Error fetching approvals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { approvalId, action, approvedBy, notes } = body;

    const { data: approval, error } = await supabase
      .from('approvals')
      .update({
        status: action === 'approve' ? 'APPROVED' : 'REJECTED',
        approved_by: approvedBy || 'admin',
        approved_at: new Date().toISOString(),
        notes,
      })
      .eq('id', approvalId)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to update approval' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, approval });
  } catch (error) {
    console.error('Error processing approval:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
