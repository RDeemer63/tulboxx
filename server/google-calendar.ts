import { google } from 'googleapis';
import type { Job, Customer } from '@shared/schema';

// Google Calendar configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || "";
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || "https://app.tulboxx.com/oauth2callback";

// Initialize OAuth2 client
const oauth2Client = new google.auth.OAuth2(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  REDIRECT_URI
);

const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

export interface CalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  location?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  colorId?: string;
}

export class GoogleCalendarService {
  private accessToken: string | null = null;

  setAccessToken(token: string) {
    this.accessToken = token;
    oauth2Client.setCredentials({ access_token: token });
  }

  // Generate OAuth URL for user authorization
  getAuthUrl(): string {
    const scopes = ['https://www.googleapis.com/auth/calendar'];
    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
    });
  }

  // Exchange authorization code for access token
  async getAccessToken(code: string): Promise<string> {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    
    if (tokens.access_token) {
      this.accessToken = tokens.access_token;
      return tokens.access_token;
    }
    
    throw new Error('Failed to obtain access token');
  }

  // Create a calendar event from a job
  async createJobEvent(job: Job & { customer: Customer }): Promise<string | null> {
    if (!this.accessToken) {
      throw new Error('No access token available. Please authorize first.');
    }

    try {
      const event: CalendarEvent = {
        summary: `${job.title} - ${job.customer.firstName} ${job.customer.lastName}`,
        description: job.description || `Job for ${job.customer.firstName} ${job.customer.lastName}`,
        location: `${job.customer.address || ''}, ${job.customer.city || ''}, ${job.customer.state || ''}`.trim().replace(/^,\s*|,\s*$/g, ''),
        start: {
          dateTime: job.scheduledDate ? new Date(job.scheduledDate).toISOString() : new Date().toISOString(),
          timeZone: 'America/New_York', // Default timezone - could be made configurable
        },
        end: {
          dateTime: job.scheduledDate 
            ? new Date(new Date(job.scheduledDate).getTime() + (2 * 60 * 60 * 1000)).toISOString() // Default 2 hour duration
            : new Date(Date.now() + (2 * 60 * 60 * 1000)).toISOString(),
          timeZone: 'America/New_York',
        },
        colorId: this.getJobColorId(job.status),
      };

      const response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
      });

      return response.data.id || null;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw error;
    }
  }

  // Update an existing calendar event
  async updateJobEvent(eventId: string, job: Job & { customer: Customer }): Promise<void> {
    if (!this.accessToken) {
      throw new Error('No access token available. Please authorize first.');
    }

    try {
      const event: CalendarEvent = {
        summary: `${job.title} - ${job.customer.firstName} ${job.customer.lastName}`,
        description: job.description || `Job for ${job.customer.firstName} ${job.customer.lastName}`,
        location: `${job.customer.address || ''}, ${job.customer.city || ''}, ${job.customer.state || ''}`.trim().replace(/^,\s*|,\s*$/g, ''),
        start: {
          dateTime: job.scheduledDate ? new Date(job.scheduledDate).toISOString() : new Date().toISOString(),
          timeZone: 'America/New_York',
        },
        end: {
          dateTime: job.scheduledDate 
            ? new Date(new Date(job.scheduledDate).getTime() + (2 * 60 * 60 * 1000)).toISOString()
            : new Date(Date.now() + (2 * 60 * 60 * 1000)).toISOString(),
          timeZone: 'America/New_York',
        },
        colorId: this.getJobColorId(job.status),
      };

      await calendar.events.update({
        calendarId: 'primary',
        eventId: eventId,
        requestBody: event,
      });
    } catch (error) {
      console.error('Error updating calendar event:', error);
      throw error;
    }
  }

  // Delete a calendar event
  async deleteJobEvent(eventId: string): Promise<void> {
    if (!this.accessToken) {
      throw new Error('No access token available. Please authorize first.');
    }

    try {
      await calendar.events.delete({
        calendarId: 'primary',
        eventId: eventId,
      });
    } catch (error) {
      console.error('Error deleting calendar event:', error);
      throw error;
    }
  }

  // Get color ID based on job status
  private getJobColorId(status: string): string {
    switch (status) {
      case 'scheduled':
        return '9'; // Blue
      case 'in_progress':
        return '5'; // Yellow
      case 'completed':
        return '10'; // Green
      case 'cancelled':
        return '11'; // Red
      default:
        return '1'; // Default color
    }
  }

  // Sync all scheduled jobs to calendar
  async syncAllJobs(jobs: (Job & { customer: Customer })[]): Promise<void> {
    if (!this.accessToken) {
      throw new Error('No access token available. Please authorize first.');
    }

    const scheduledJobs = jobs.filter(job => 
      job.scheduledDate && 
      (job.status === 'scheduled' || job.status === 'in_progress')
    );

    for (const job of scheduledJobs) {
      try {
        if (job.calendarEventId) {
          // Update existing event
          await this.updateJobEvent(job.calendarEventId, job);
        } else {
          // Create new event
          const eventId = await this.createJobEvent(job);
          // Note: You would need to update the job record with the eventId
          // This would require updating the database schema and storage methods
        }
      } catch (error) {
        console.error(`Failed to sync job ${job.id}:`, error);
      }
    }
  }
}

export const googleCalendarService = new GoogleCalendarService();