import { leadRepository } from '../repositories/leadRepository';

/**
 * Standard lead activity types for consistent logging
 */
export enum LeadActivityType {
  CREATED = 'created',
  NOTE = 'note',
  CALL = 'call',
  EMAIL = 'email',
  TEXT = 'text',
  MEETING = 'meeting',
  ESTIMATE_SENT = 'estimate_sent',
  ESTIMATE_VIEWED = 'estimate_viewed',
  FOLLOW_UP_SET = 'follow_up_set',
  FOLLOW_UP_COMPLETED = 'follow_up_completed',
  STAGE_CHANGE = 'stage_change',
  STATUS_CHANGE = 'status_change',
  ASSIGNED = 'assigned',
  CUSTOM = 'custom'
}

/**
 * Interface for activity metadata
 */
export interface ActivityMeta {
  [key: string]: any;
}

/**
 * Log a lead activity with standardized formatting
 * 
 * @param leadId - UUID of the lead
 * @param type - Activity type (from LeadActivityType enum)
 * @param content - Activity description or content
 * @param userId - Optional UUID of the user who performed the activity
 * @param meta - Optional metadata for the activity (structured data)
 * @returns The created lead event
 */
export async function logLeadActivity(
  leadId: string,
  type: LeadActivityType | string,
  content: string,
  userId?: string,
  meta: ActivityMeta = {}
) {
  return leadRepository.logActivity(leadId, type, content, userId, meta);
}

/**
 * Log a phone call with a lead
 * 
 * @param leadId - UUID of the lead
 * @param notes - Notes from the call
 * @param userId - UUID of the user who made the call
 * @param duration - Call duration in seconds (optional)
 * @param outcome - Call outcome (e.g., "left voicemail", "scheduled meeting")
 * @returns The created lead event
 */
export function logLeadCall(
  leadId: string,
  notes: string,
  userId: string,
  duration?: number,
  outcome?: string
) {
  const meta: ActivityMeta = {};
  if (duration !== undefined) meta.duration = duration;
  if (outcome) meta.outcome = outcome;
  
  const content = outcome 
    ? `Call: ${outcome}${notes ? ' - ' + notes : ''}`
    : `Call${notes ? ': ' + notes : ''}`;
  
  return logLeadActivity(leadId, LeadActivityType.CALL, content, userId, meta);
}

/**
 * Log an email sent to or received from a lead
 * 
 * @param leadId - UUID of the lead
 * @param direction - "sent" or "received"
 * @param subject - Email subject
 * @param userId - UUID of the user who sent/received the email
 * @param emailContent - Optional email content summary
 * @returns The created lead event
 */
export function logLeadEmail(
  leadId: string,
  direction: 'sent' | 'received',
  subject: string,
  userId: string,
  emailContent?: string
) {
  const content = `Email ${direction}: ${subject}`;
  const meta: ActivityMeta = { direction, subject };
  if (emailContent) meta.content = emailContent;
  
  return logLeadActivity(leadId, LeadActivityType.EMAIL, content, userId, meta);
}

/**
 * Log a text message sent to or received from a lead
 * 
 * @param leadId - UUID of the lead
 * @param direction - "sent" or "received"
 * @param message - Text message content
 * @param userId - UUID of the user who sent/received the text
 * @returns The created lead event
 */
export function logLeadText(
  leadId: string,
  direction: 'sent' | 'received',
  message: string,
  userId: string
) {
  const content = `Text ${direction}: ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}`;
  return logLeadActivity(leadId, LeadActivityType.TEXT, content, userId, { direction, message });
}

/**
 * Log a note about a lead
 * 
 * @param leadId - UUID of the lead
 * @param note - Note content
 * @param userId - UUID of the user who created the note
 * @returns The created lead event
 */
export function logLeadNote(
  leadId: string,
  note: string,
  userId: string
) {
  return logLeadActivity(leadId, LeadActivityType.NOTE, note, userId);
}

/**
 * Log a meeting with a lead
 * 
 * @param leadId - UUID of the lead
 * @param summary - Meeting summary
 * @param userId - UUID of the user who conducted the meeting
 * @param date - Meeting date
 * @param duration - Meeting duration in minutes (optional)
 * @param attendees - List of attendee names (optional)
 * @returns The created lead event
 */
export function logLeadMeeting(
  leadId: string,
  summary: string,
  userId: string,
  date: Date,
  duration?: number,
  attendees?: string[]
) {
  const meta: ActivityMeta = { date: date.toISOString() };
  if (duration !== undefined) meta.duration = duration;
  if (attendees) meta.attendees = attendees;
  
  const content = `Meeting: ${summary}`;
  return logLeadActivity(leadId, LeadActivityType.MEETING, content, userId, meta);
}

/**
 * Log an estimate sent to a lead
 * 
 * @param leadId - UUID of the lead
 * @param estimateId - ID of the estimate
 * @param amount - Estimate amount
 * @param userId - UUID of the user who sent the estimate
 * @returns The created lead event
 */
export function logEstimateSent(
  leadId: string,
  estimateId: string | number,
  amount: number,
  userId: string
) {
  const content = `Estimate sent: $${amount.toLocaleString()}`;
  return logLeadActivity(
    leadId, 
    LeadActivityType.ESTIMATE_SENT, 
    content, 
    userId, 
    { estimateId, amount }
  );
}

/**
 * Log a stage change for a lead
 * 
 * @param leadId - UUID of the lead
 * @param fromStage - Previous stage
 * @param toStage - New stage
 * @param userId - UUID of the user who changed the stage
 * @param reason - Optional reason for the stage change
 * @returns The created lead event
 */
export function logStageChange(
  leadId: string,
  fromStage: string,
  toStage: string,
  userId: string,
  reason?: string
) {
  const content = `Moved from ${fromStage} to ${toStage}${reason ? ': ' + reason : ''}`;
  return logLeadActivity(
    leadId,
    LeadActivityType.STAGE_CHANGE,
    content,
    userId,
    { fromStage, toStage, reason }
  );
}

/**
 * Log when a lead is assigned to a user
 * 
 * @param leadId - UUID of the lead
 * @param assignedToUserId - UUID of the user the lead is assigned to
 * @param assignedByUserId - UUID of the user who made the assignment
 * @returns The created lead event
 */
export function logLeadAssigned(
  leadId: string,
  assignedToUserId: string,
  assignedByUserId: string
) {
  const content = `Lead assigned to user ID: ${assignedToUserId}`;
  return logLeadActivity(
    leadId,
    LeadActivityType.ASSIGNED,
    content,
    assignedByUserId,
    { assignedTo: assignedToUserId }
  );
}
