import { supabase } from './db';
import sendFollowUpEmail from './email-nodemailer';
import { addDays } from 'date-fns';

export type Category = 'HOT' | 'WARM' | 'COLD' | 'PENDING';
export type FollowUpType = 'INITIAL' | 'FIRST_FOLLOWUP' | 'SECOND_FOLLOWUP' | 'THIRD_FOLLOWUP' | 'CUSTOM';

export interface FollowUpSchedule {
  type: FollowUpType;
  daysFromNow: number;
  message: string;
}

export function getFollowUpSchedule(category: Category): FollowUpSchedule[] {
  switch (category) {
    case 'HOT':
      return [
        {
          type: 'INITIAL',
          daysFromNow: 0,
          message: 'Thank you for your urgent inquiry! We\'re excited to help with your project. A senior consultant will contact you within the hour to discuss your requirements.',
        },
        {
          type: 'FIRST_FOLLOWUP',
          daysFromNow: 1,
          message: 'Following up on our conversation. Have you had a chance to review the product specifications we discussed? I\'d be happy to schedule a site visit or provide samples.',
        },
      ];
    
    case 'WARM':
      return [
        {
          type: 'INITIAL',
          daysFromNow: 0,
          message: 'Thank you for your interest! I\'ve attached our product catalog and pricing guide. What specific requirements are you looking for?',
        },
        {
          type: 'FIRST_FOLLOWUP',
          daysFromNow: 3,
          message: 'Just checking in! Did you get a chance to review our products? I can help answer any technical questions or arrange a showroom visit.',
        },
        {
          type: 'SECOND_FOLLOWUP',
          daysFromNow: 7,
          message: 'I wanted to share some recent projects similar to what you\'re planning. Many clients find these case studies helpful. Would you like to see them?',
        },
      ];
    
    case 'COLD':
      return [
        {
          type: 'INITIAL',
          daysFromNow: 0,
          message: 'Thanks for reaching out! We\'re here whenever you\'re ready. I\'ve added you to our newsletter for product updates and special offers.',
        },
        {
          type: 'FIRST_FOLLOWUP',
          daysFromNow: 7,
          message: 'Hope you\'re doing well! We have some exciting new arrivals that might interest you. Would you like an updated catalog?',
        },
        {
          type: 'SECOND_FOLLOWUP',
          daysFromNow: 14,
          message: 'We\'re running a limited-time promotion on select products this month. Thought you might want to know!',
        },
        {
          type: 'THIRD_FOLLOWUP',
          daysFromNow: 30,
          message: 'Final check-in! If you need anything in the future, feel free to reach out. We\'re always here to help.',
        },
      ];
    
    default:
      return [];
  }
}

export async function scheduleFollowUps(leadId: string, category: Category) {
  const schedule = getFollowUpSchedule(category);
  const now = new Date();
  
  for (const item of schedule) {
    await supabase.from('follow_ups').insert({
      lead_id: leadId,
      type: item.type,
      scheduled_at: addDays(now, item.daysFromNow).toISOString(),
      message: item.message,
      status: 'PENDING',
      approved: false,
    });
  }
}

export async function approveFollowUp(followUpId: string, approvedBy: string) {
  return await supabase
    .from('follow_ups')
    .update({
      approved: true,
      approved_by: approvedBy,
      approved_at: new Date().toISOString(),
      status: 'APPROVED',
    })
    .eq('id', followUpId);
}

export async function sendFollowUp(followUpId: string) {
  const { data: followUp } = await supabase
    .from('follow_ups')
    .select(`
      *,
      leads(*)
    `)
    .eq('id', followUpId)
    .single();
  
  if (!followUp || !followUp.approved) {
    throw new Error('Follow-up not found or not approved');
  }
  
  // Send follow-up email using Nodemailer
  const to = followUp.leads.email as string;
  const name = followUp.leads.name as string;
  const subject = `Following up on your ${followUp.leads.product_interest} inquiry`;
  const message = followUp.message as string;

  try {
    await sendFollowUpEmail(to, name, subject, message);

    // Mark as sent
    await supabase
      .from('follow_ups')
      .update({
        status: 'SENT',
        completed_at: new Date().toISOString(),
      })
      .eq('id', followUpId);

    return true;
  } catch (err) {
    console.error('Failed to send follow-up email:', err);

    // Mark as failed (optional)
    await supabase
      .from('follow_ups')
      .update({
        status: 'FAILED',
      })
      .eq('id', followUpId);

    throw err;
  }
}
