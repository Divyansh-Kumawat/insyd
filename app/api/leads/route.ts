import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { categorizeLead } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, company, productInterest, message } = body;

    // Validate required fields
    if (!name || !email || !phone || !productInterest || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Use AI to categorize the lead
    const categorization = await categorizeLead(
      name,
      email,
      phone,
      company,
      productInterest,
      message
    );

    // Create the lead in database
    const { data: lead, error } = await supabase
      .from('leads')
      .insert({
        name,
        email,
        phone,
        company: company || null,
        product_interest: productInterest,
        message,
        category: categorization.category,
        ai_category: categorization.category,
        ai_confidence: categorization.confidence,
        ai_reasoning: categorization.reasoning,
        priority: categorization.category === 'HOT' ? 'HIGH' : 
                  categorization.category === 'WARM' ? 'MEDIUM' : 'LOW',
        status: 'NEW',
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to create lead' },
        { status: 500 }
      );
    }

    // Schedule automated follow-ups
    const followUpSchedules = [
      { hours: 0.5, type: 'INITIAL' },
      { hours: 24, type: 'FIRST_FOLLOWUP' },
      { hours: 72, type: 'SECOND_FOLLOWUP' },
    ];

    for (const schedule of followUpSchedules) {
      const scheduledAt = new Date(Date.now() + schedule.hours * 60 * 60 * 1000);
      await supabase.from('follow_ups').insert({
        lead_id: lead.id,
        type: schedule.type,
        scheduled_at: scheduledAt.toISOString(),
        status: 'PENDING',
        message: `Automated ${schedule.type} follow-up`,
      });
    }

    return NextResponse.json({
      success: true,
      lead: {
        id: lead.id,
        category: lead.category,
        confidence: lead.ai_confidence,
        reasoning: lead.ai_reasoning,
      },
    });
  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status');

    let query = supabase
      .from('leads')
      .select(`
        *,
        follow_ups(*),
        approvals(*)
      `)
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data: leads, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch leads' },
        { status: 500 }
      );
    }

    // Transform snake_case to camelCase for frontend
    const transformedLeads = leads?.map(lead => ({
      id: lead.id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      productInterest: lead.product_interest,
      message: lead.message,
      category: lead.category,
      aiConfidence: lead.ai_confidence,
      aiReasoning: lead.ai_reasoning,
      status: lead.status,
      priority: lead.priority,
      createdAt: lead.created_at,
      followUps: lead.follow_ups || [],
      approvals: lead.approvals || [],
    })) || [];

    return NextResponse.json(transformedLeads);
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Lead ID is required' },
        { status: 400 }
      );
    }

    // Map the incoming snake_case/camelCase mix to correct database columns
    const dbUpdates: any = {};
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.email) dbUpdates.email = updates.email;
    if (updates.phone) dbUpdates.phone = updates.phone;
    if (updates.company) dbUpdates.company = updates.company;
    if (updates.productInterest) dbUpdates.product_interest = updates.productInterest; 
    if (updates.message) dbUpdates.message = updates.message;
    if (updates.category) dbUpdates.category = updates.category;
    if (updates.status) dbUpdates.status = updates.status;
    if (updates.priority) dbUpdates.priority = updates.priority;
    
    // Always update updated_at
    dbUpdates.updated_at = new Date().toISOString();

    const { data: lead, error } = await supabase
      .from('leads')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: 'Failed to update lead' },
        { status: 500 }
      );
    }

    // Transform response for frontend
    const transformedLead = {
      id: lead.id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      productInterest: lead.product_interest,
      message: lead.message,
      category: lead.category,
      aiConfidence: lead.ai_confidence,
      aiReasoning: lead.ai_reasoning,
      status: lead.status,
      priority: lead.priority,
      createdAt: lead.created_at,
    };

    return NextResponse.json({
      success: true,
      lead: transformedLead,
    });
  } catch (error) {
    console.error('Error updating lead:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
