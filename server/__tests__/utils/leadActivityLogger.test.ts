import {
  logLeadActivity,
  logLeadCall,
  logLeadEmail,
  logLeadText,
  logLeadNote,
  logLeadMeeting,
  logEstimateSent,
  logStageChange,
  logLeadAssigned,
  LeadActivityType,
} from '../../utils/leadActivityLogger';
import { leadRepository } from '../../repositories/leadRepository';

// Mock the leadRepository
jest.mock('../../repositories/leadRepository', () => ({
  leadRepository: {
    logActivity: jest.fn().mockResolvedValue({ id: 'mock-activity-id' }),
  },
}));

describe('leadActivityLogger', () => {
  const mockLeadId = 'test-lead-id';
  const mockUserId = 'test-user-id';

  beforeEach(() => {
    // Clear all mocks before each test to ensure isolation
    jest.clearAllMocks();
  });

  describe('logLeadActivity', () => {
    it('should call leadRepository.logActivity with correct parameters', async () => {
      const type = 'custom';
      const content = 'This is a custom activity.';
      const meta = { customField: 'value' };

      await logLeadActivity(mockLeadId, type, content, mockUserId, meta);

      expect(leadRepository.logActivity).toHaveBeenCalledWith(
        mockLeadId,
        type,
        content,
        mockUserId,
        meta
      );
    });

    it('should handle undefined userId and empty meta gracefully', async () => {
      const type = 'note';
      const content = 'A simple note.';

      await logLeadActivity(mockLeadId, type, content);

      expect(leadRepository.logActivity).toHaveBeenCalledWith(
        mockLeadId,
        type,
        content,
        undefined,
        {}
      );
    });
  });

  describe('logLeadCall', () => {
    it('should log a call with notes, duration, and outcome', async () => {
      const notes = 'Discussed project scope.';
      const duration = 120;
      const outcome = 'Scheduled follow-up';

      await logLeadCall(mockLeadId, notes, mockUserId, duration, outcome);

      expect(leadRepository.logActivity).toHaveBeenCalledWith(
        mockLeadId,
        LeadActivityType.CALL,
        `Call: ${outcome} - ${notes}`,
        mockUserId,
        { duration, outcome }
      );
    });

    it('should log a call with only notes', async () => {
      const notes = 'Quick check-in.';

      await logLeadCall(mockLeadId, notes, mockUserId);

      expect(leadRepository.logActivity).toHaveBeenCalledWith(
        mockLeadId,
        LeadActivityType.CALL,
        `Call: ${notes}`,
        mockUserId,
        {}
      );
    });
  });

  describe('logLeadEmail', () => {
    it('should log an email sent with subject and content', async () => {
      const direction = 'sent';
      const subject = 'Proposal for your project';
      const emailContent = 'Detailed proposal attached.';

      await logLeadEmail(mockLeadId, direction, subject, mockUserId, emailContent);

      expect(leadRepository.logActivity).toHaveBeenCalledWith(
        mockLeadId,
        LeadActivityType.EMAIL,
        `Email ${direction}: ${subject}`,
        mockUserId,
        { direction, subject, content: emailContent }
      );
    });

    it('should log an email received without content', async () => {
      const direction = 'received';
      const subject = 'Re: Your inquiry';

      await logLeadEmail(mockLeadId, direction, subject, mockUserId);

      expect(leadRepository.logActivity).toHaveBeenCalledWith(
        mockLeadId,
        LeadActivityType.EMAIL,
        `Email ${direction}: ${subject}`,
        mockUserId,
        { direction, subject }
      );
    });
  });

  describe('logLeadText', () => {
    it('should log a text message sent', async () => {
      const direction = 'sent';
      const message = 'Confirming our meeting tomorrow.';

      await logLeadText(mockLeadId, direction, message, mockUserId);

      expect(leadRepository.logActivity).toHaveBeenCalledWith(
        mockLeadId,
        LeadActivityType.TEXT,
        `Text ${direction}: ${message}`,
        mockUserId,
        { direction, message }
      );
    });

    it('should truncate long text messages', async () => {
      const direction = 'received';
      const longMessage = 'This is a very long text message that should be truncated when logged to the activity timeline to keep the display concise and readable.';

      await logLeadText(mockLeadId, direction, longMessage, mockUserId);

      expect(leadRepository.logActivity).toHaveBeenCalledWith(
        mockLeadId,
        LeadActivityType.TEXT,
        `Text ${direction}: ${longMessage.substring(0, 100)}...`,
        mockUserId,
        { direction, message: longMessage }
      );
    });
  });

  describe('logLeadNote', () => {
    it('should log a note', async () => {
      const note = 'Customer prefers evening calls.';

      await logLeadNote(mockLeadId, note, mockUserId);

      expect(leadRepository.logActivity).toHaveBeenCalledWith(
        mockLeadId,
        LeadActivityType.NOTE,
        note,
        mockUserId,
        {}
      );
    });
  });

  describe('logLeadMeeting', () => {
    it('should log a meeting with all details', async () => {
      const summary = 'Initial consultation';
      const date = new Date('2024-07-20T14:00:00Z');
      const duration = 60;
      const attendees = ['John Doe', 'Jane Smith'];

      await logLeadMeeting(mockLeadId, summary, mockUserId, date, duration, attendees);

      expect(leadRepository.logActivity).toHaveBeenCalledWith(
        mockLeadId,
        LeadActivityType.MEETING,
        `Meeting: ${summary}`,
        mockUserId,
        { date: date.toISOString(), duration, attendees }
      );
    });

    it('should log a meeting with only required details', async () => {
      const summary = 'Follow-up discussion';
      const date = new Date('2024-07-21T10:00:00Z');

      await logLeadMeeting(mockLeadId, summary, mockUserId, date);

      expect(leadRepository.logActivity).toHaveBeenCalledWith(
        mockLeadId,
        LeadActivityType.MEETING,
        `Meeting: ${summary}`,
        mockUserId,
        { date: date.toISOString() }
      );
    });
  });

  describe('logEstimateSent', () => {
    it('should log an estimate sent event', async () => {
      const estimateId = 'est-001';
      const amount = 5000;

      await logEstimateSent(mockLeadId, estimateId, amount, mockUserId);

      expect(leadRepository.logActivity).toHaveBeenCalledWith(
        mockLeadId,
        LeadActivityType.ESTIMATE_SENT,
        `Estimate sent: $${amount.toLocaleString()}`,
        mockUserId,
        { estimateId, amount }
      );
    });
  });

  describe('logStageChange', () => {
    it('should log a stage change with a reason', async () => {
      const fromStage = 'new';
      const toStage = 'contacted';
      const reason = 'Customer responded to email';

      await logStageChange(mockLeadId, fromStage, toStage, mockUserId, reason);

      expect(leadRepository.logActivity).toHaveBeenCalledWith(
        mockLeadId,
        LeadActivityType.STAGE_CHANGE,
        `Moved from ${fromStage} to ${toStage}: ${reason}`,
        mockUserId,
        { fromStage, toStage, reason }
      );
    });

    it('should log a stage change without a reason', async () => {
      const fromStage = 'contacted';
      const toStage = 'estimate_sent';

      await logStageChange(mockLeadId, fromStage, toStage, mockUserId);

      expect(leadRepository.logActivity).toHaveBeenCalledWith(
        mockLeadId,
        LeadActivityType.STAGE_CHANGE,
        `Moved from ${fromStage} to ${toStage}`,
        mockUserId,
        { fromStage, toStage }
      );
    });
  });

  describe('logLeadAssigned', () => {
    it('should log when a lead is assigned', async () => {
      const assignedToUserId = 'assigned-user-id';

      await logLeadAssigned(mockLeadId, assignedToUserId, mockUserId);

      expect(leadRepository.logActivity).toHaveBeenCalledWith(
        mockLeadId,
        LeadActivityType.ASSIGNED,
        `Lead assigned to user ID: ${assignedToUserId}`,
        mockUserId,
        { assignedTo: assignedToUserId }
      );
    });
  });
});
