import { LeadService } from '../../services/leadService';
import { LeadRepository } from '../../repositories/leadRepository';
import { jobService } from '../../services/jobService';
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
import { NotFoundError, BadRequestError, ConflictError } from '../../utils/errors';
import { leads } from '../../../shared/schema';
import { eq, or } from 'drizzle-orm';

// Mock the LeadRepository
jest.mock('../../repositories/leadRepository');
const mockLeadRepository = LeadRepository as jest.MockedClass<typeof LeadRepository>;
const leadRepositoryInstance = new mockLeadRepository();

// Mock the leadActivityLogger functions
jest.mock('../../utils/leadActivityLogger', () => ({
  logLeadActivity: jest.fn(),
  logLeadCall: jest.fn(),
  logLeadEmail: jest.fn(),
  logLeadText: jest.fn(),
  logLeadNote: jest.fn(),
  logLeadMeeting: jest.fn(),
  logEstimateSent: jest.fn(),
  logStageChange: jest.fn(),
  logLeadAssigned: jest.fn(),
  LeadActivityType: {
    CREATED: 'created',
    NOTE: 'note',
    CALL: 'call',
    EMAIL: 'email',
    TEXT: 'text',
    MEETING: 'meeting',
    ESTIMATE_SENT: 'estimate_sent',
    ESTIMATE_VIEWED: 'estimate_viewed',
    FOLLOW_UP_SET: 'follow_up_set',
    FOLLOW_UP_COMPLETED: 'follow_up_completed',
    STAGE_CHANGE: 'stage_change',
    STATUS_CHANGE: 'status_change',
    ASSIGNED: 'assigned',
    CUSTOM: 'custom',
  },
}));

// Mock the jobService
jest.mock('../../services/jobService');
const mockJobService = jobService as jest.Mocked<typeof jobService>;

// Mock the db import for findPotentialDuplicates
jest.mock('../../db', () => ({
  db: {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    offset: jest.fn().mockReturnThis(),
    execute: jest.fn(),
    returning: jest.fn(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    transaction: jest.fn((callback) => callback({
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      returning: jest.fn(),
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
    })),
  },
}));

// Mock the schema imports for findPotentialDuplicates
jest.mock('../../../shared/schema', () => ({
  leads: {
    id: 'leads.id',
    fullName: 'leads.fullName',
    phone: 'leads.phone',
    email: 'leads.email',
    serviceType: 'leads.serviceType',
    source: 'leads.source',
    notes: 'leads.notes',
    stage: 'leads.stage',
    followUpDate: 'leads.followUpDate',
    createdAt: 'leads.createdAt',
    updatedAt: 'leads.updatedAt',
    assignedTo: 'leads.assignedTo',
    originContactId: 'leads.originContactId',
    jobId: 'leads.jobId',
  },
  leadEvents: {
    id: 'leadEvents.id',
    leadId: 'leadEvents.leadId',
    type: 'leadEvents.type',
    content: 'leadEvents.content',
    createdAt: 'leadEvents.createdAt',
    createdBy: 'leadEvents.createdBy',
    meta: 'leadEvents.meta',
  },
}));

const leadService = new LeadService();

describe('LeadService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset mock implementations for each test
    mockLeadRepository.mockClear();
    mockLeadRepository.mockImplementation(() => leadRepositoryInstance);
    for (const key in leadRepositoryInstance) {
      if (typeof (leadRepositoryInstance as any)[key] === 'function') {
        (leadRepositoryInstance as any)[key].mockClear();
      }
    }
    (logLeadActivity as jest.Mock).mockClear();
    (logLeadCall as jest.Mock).mockClear();
    (logLeadEmail as jest.Mock).mockClear();
    (logLeadText as jest.Mock).mockClear();
    (logLeadNote as jest.Mock).mockClear();
    (logLeadMeeting as jest.Mock).mockClear();
    (logEstimateSent as jest.Mock).mockClear();
    (logStageChange as jest.Mock).mockClear();
    (logLeadAssigned as jest.Mock).mockClear();
    mockJobService.createJob.mockClear();
  });

  const mockLead = {
    id: 'lead1',
    fullName: 'Test Lead',
    phone: '123-456-7890',
    email: 'test@example.com',
    stage: 'new',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockLeadEvent = {
    id: 'event1',
    leadId: 'lead1',
    type: 'created',
    content: 'Lead created',
    createdAt: new Date(),
  };

  describe('getLeads', () => {
    it('should call leadRepository.getLeads with provided parameters', async () => {
      leadRepositoryInstance.getLeads.mockResolvedValue({ data: [mockLead], pagination: { total: 1, page: 1, limit: 10, pages: 1 } });
      const params = { page: 1, limit: 10, search: 'test' };
      const result = await leadService.getLeads(params);
      expect(leadRepositoryInstance.getLeads).toHaveBeenCalledWith(params);
      expect(result.data).toEqual([mockLead]);
    });
  });

  describe('getLeadsByStage', () => {
    it('should call leadRepository.getLeadsByStage with provided parameters', async () => {
      leadRepositoryInstance.getLeadsByStage.mockResolvedValue({ new: [mockLead] });
      const params = { search: 'test' };
      const result = await leadService.getLeadsByStage(params);
      expect(leadRepositoryInstance.getLeadsByStage).toHaveBeenCalledWith(params);
      expect(result).toEqual({ new: [mockLead] });
    });
  });

  describe('getLead', () => {
    it('should call leadRepository.getLead and getLeadEvents', async () => {
      leadRepositoryInstance.getLead.mockResolvedValue(mockLead);
      leadRepositoryInstance.getLeadEvents.mockResolvedValue([mockLeadEvent]);
      const result = await leadService.getLead('lead1');
      expect(leadRepositoryInstance.getLead).toHaveBeenCalledWith('lead1');
      expect(leadRepositoryInstance.getLeadEvents).toHaveBeenCalledWith('lead1');
      expect(result).toEqual({ lead: mockLead, events: [mockLeadEvent] });
    });

    it('should throw NotFoundError if lead not found', async () => {
      leadRepositoryInstance.getLead.mockRejectedValue(new NotFoundError('Lead not found'));
      await expect(leadService.getLead('nonexistent')).rejects.toThrow(NotFoundError);
    });
  });

  describe('findPotentialDuplicates', () => {
    it('should return empty array if no phone or email provided', async () => {
      const { db } = require('../../db');
      const result = await leadService.findPotentialDuplicates('', undefined);
      expect(db.select).not.toHaveBeenCalled();
      expect(result).toEqual([]);
    });

    it('should find duplicates by phone', async () => {
      const { db } = require('../../db');
      db.select.mockReturnThis();
      db.from.mockReturnThis();
      db.where.mockResolvedValueOnce([mockLead]);
      const result = await leadService.findPotentialDuplicates('123-456-7890', undefined);
      expect(db.select).toHaveBeenCalledWith();
      expect(db.from).toHaveBeenCalledWith(leads);
      expect(db.where).toHaveBeenCalledWith(or(eq(leads.phone, '123-456-7890')));
      expect(result).toEqual([mockLead]);
    });

    it('should find duplicates by email', async () => {
      const { db } = require('../../db');
      db.select.mockReturnThis();
      db.from.mockReturnThis();
      db.where.mockResolvedValueOnce([mockLead]);
      const result = await leadService.findPotentialDuplicates('', 'test@example.com');
      expect(db.select).toHaveBeenCalledWith();
      expect(db.from).toHaveBeenCalledWith(leads);
      expect(db.where).toHaveBeenCalledWith(or(eq(leads.email, 'test@example.com')));
      expect(result).toEqual([mockLead]);
    });
  });

  describe('createLead', () => {
    const newLeadData = {
      fullName: 'New Lead',
      phone: '111-222-3333',
      email: 'new@example.com',
    };

    it('should create a new lead and log activity', async () => {
      leadRepositoryInstance.createLead.mockResolvedValue(mockLead);
      const result = await leadService.createLead(newLeadData, 'user1');
      expect(leadRepositoryInstance.createLead).toHaveBeenCalledWith(newLeadData);
      expect(logLeadActivity).toHaveBeenCalledWith(
        mockLead.id,
        LeadActivityType.CREATED,
        `Lead created: ${mockLead.fullName}`,
        'user1'
      );
      expect(result.lead).toEqual(mockLead);
      expect(result.hasDuplicates).toBe(false);
    });

    it('should return duplicates if found but still create lead', async () => {
      leadRepositoryInstance.createLead.mockResolvedValue(mockLead);
      const { db } = require('../../db');
      db.select.mockReturnThis();
      db.from.mockReturnThis();
      db.where.mockResolvedValueOnce([mockLead]); // Simulate duplicate found
      const result = await leadService.createLead(newLeadData, 'user1');
      expect(result.lead).toEqual(mockLead);
      expect(result.hasDuplicates).toBe(true);
      expect(result.duplicates).toEqual([mockLead]);
    });

    it('should throw BadRequestError for invalid data', async () => {
      await expect(leadService.createLead({ fullName: '' }, 'user1')).rejects.toThrow(BadRequestError);
    });
  });

  describe('updateLead', () => {
    const updateData = { email: 'updated@example.com' };

    it('should update a lead and log activity', async () => {
      leadRepositoryInstance.getLead.mockResolvedValue(mockLead);
      leadRepositoryInstance.updateLead.mockResolvedValue({ ...mockLead, ...updateData });
      const result = await leadService.updateLead('lead1', updateData, 'user1');
      expect(leadRepositoryInstance.getLead).toHaveBeenCalledWith('lead1');
      expect(leadRepositoryInstance.updateLead).toHaveBeenCalledWith('lead1', updateData);
      expect(logLeadActivity).toHaveBeenCalledWith(
        'lead1',
        'updated',
        `Lead updated: ["email"]`,
        'user1'
      );
      expect(result.lead.email).toEqual(updateData.email);
      expect(result.hasDuplicates).toBe(false);
    });

    it('should return duplicates if found but still update lead', async () => {
      leadRepositoryInstance.getLead.mockResolvedValue(mockLead);
      leadRepositoryInstance.updateLead.mockResolvedValue({ ...mockLead, ...updateData });
      const { db } = require('../../db');
      db.select.mockReturnThis();
      db.from.mockReturnThis();
      db.where.mockResolvedValueOnce([{ ...mockLead, id: 'duplicate1' }]); // Simulate duplicate found
      const result = await leadService.updateLead('lead1', updateData, 'user1');
      expect(result.lead.email).toEqual(updateData.email);
      expect(result.hasDuplicates).toBe(true);
      expect(result.duplicates).toEqual([{ ...mockLead, id: 'duplicate1' }]);
    });

    it('should throw NotFoundError if lead not found', async () => {
      leadRepositoryInstance.getLead.mockRejectedValue(new NotFoundError('Lead not found'));
      await expect(leadService.updateLead('nonexistent', updateData, 'user1')).rejects.toThrow(NotFoundError);
    });

    it('should throw BadRequestError for invalid data', async () => {
      leadRepositoryInstance.getLead.mockResolvedValue(mockLead);
      await expect(leadService.updateLead('lead1', { phone: 'invalid' }, 'user1')).rejects.toThrow(BadRequestError);
    });
  });

  describe('deleteLead', () => {
    it('should delete a lead and log activity', async () => {
      leadRepositoryInstance.getLead.mockResolvedValue(mockLead);
      leadRepositoryInstance.deleteLead.mockResolvedValue(mockLead);
      await leadService.deleteLead('lead1', 'user1');
      expect(leadRepositoryInstance.getLead).toHaveBeenCalledWith('lead1');
      expect(logLeadActivity).toHaveBeenCalledWith('lead1', 'deleted', 'Lead deleted', 'user1');
      expect(leadRepositoryInstance.deleteLead).toHaveBeenCalledWith('lead1');
    });

    it('should throw NotFoundError if lead not found', async () => {
      leadRepositoryInstance.getLead.mockRejectedValue(new NotFoundError('Lead not found'));
      await expect(leadService.deleteLead('nonexistent', 'user1')).rejects.toThrow(NotFoundError);
    });
  });

  describe('addNote', () => {
    it('should check if lead exists and log a note', async () => {
      leadRepositoryInstance.getLead.mockResolvedValue(mockLead);
      await leadService.addNote('lead1', 'Test note', 'user1');
      expect(leadRepositoryInstance.getLead).toHaveBeenCalledWith('lead1');
      expect(logLeadNote).toHaveBeenCalledWith('lead1', 'Test note', 'user1');
    });

    it('should throw NotFoundError if lead not found', async () => {
      leadRepositoryInstance.getLead.mockRejectedValue(new NotFoundError('Lead not found'));
      await expect(leadService.addNote('nonexistent', 'Test note', 'user1')).rejects.toThrow(NotFoundError);
    });
  });

  describe('logCall', () => {
    it('should check if lead exists and log a call', async () => {
      leadRepositoryInstance.getLead.mockResolvedValue(mockLead);
      await leadService.logCall('lead1', 'Test call', 'user1', 60, 'Left voicemail');
      expect(leadRepositoryInstance.getLead).toHaveBeenCalledWith('lead1');
      expect(logLeadCall).toHaveBeenCalledWith('lead1', 'Test call', 'user1', 60, 'Left voicemail');
    });

    it('should move new lead to contacted stage after call', async () => {
      leadRepositoryInstance.getLead.mockResolvedValue({ ...mockLead, stage: 'new' });
      await leadService.logCall('lead1', 'Test call', 'user1');
      expect(leadRepositoryInstance.moveToStage).toHaveBeenCalledWith('lead1', 'contacted', 'user1', 'Automatically moved after call');
    });

    it('should not change stage if lead is not new', async () => {
      leadRepositoryInstance.getLead.mockResolvedValue({ ...mockLead, stage: 'contacted' });
      await leadService.logCall('lead1', 'Test call', 'user1');
      expect(leadRepositoryInstance.moveToStage).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError if lead not found', async () => {
      leadRepositoryInstance.getLead.mockRejectedValue(new NotFoundError('Lead not found'));
      await expect(leadService.logCall('nonexistent', 'Test call', 'user1')).rejects.toThrow(NotFoundError);
    });
  });

  describe('logEmail', () => {
    it('should check if lead exists and log an email', async () => {
      leadRepositoryInstance.getLead.mockResolvedValue(mockLead);
      await leadService.logEmail('lead1', 'sent', 'Test subject', 'user1', 'Email content');
      expect(leadRepositoryInstance.getLead).toHaveBeenCalledWith('lead1');
      expect(logLeadEmail).toHaveBeenCalledWith('lead1', 'sent', 'Test subject', 'user1', 'Email content');
    });

    it('should move new lead to contacted stage after sent email', async () => {
      leadRepositoryInstance.getLead.mockResolvedValue({ ...mockLead, stage: 'new' });
      await leadService.logEmail('lead1', 'sent', 'Test subject', 'user1');
      expect(leadRepositoryInstance.moveToStage).toHaveBeenCalledWith('lead1', 'contacted', 'user1', 'Automatically moved after email');
    });

    it('should not change stage if lead is not new', async () => {
      leadRepositoryInstance.getLead.mockResolvedValue({ ...mockLead, stage: 'contacted' });
      await leadService.logEmail('lead1', 'sent', 'Test subject', 'user1');
      expect(leadRepositoryInstance.moveToStage).not.toHaveBeenCalled();
    });

    it('should not change stage for received emails', async () => {
      leadRepositoryInstance.getLead.mockResolvedValue({ ...mockLead, stage: 'new' });
      await leadService.logEmail('lead1', 'received', 'Test subject', 'user1');
      expect(leadRepositoryInstance.moveToStage).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError if lead not found', async () => {
      leadRepositoryInstance.getLead.mockRejectedValue(new NotFoundError('Lead not found'));
      await expect(leadService.logEmail('nonexistent', 'sent', 'Test subject', 'user1')).rejects.toThrow(NotFoundError);
    });
  });

  describe('logText', () => {
    it('should check if lead exists and log a text message', async () => {
      leadRepositoryInstance.getLead.mockResolvedValue(mockLead);
      await leadService.logText('lead1', 'sent', 'Test message', 'user1');
      expect(leadRepositoryInstance.getLead).toHaveBeenCalledWith('lead1');
      expect(logLeadText).toHaveBeenCalledWith('lead1', 'sent', 'Test message', 'user1');
    });

    it('should move new lead to contacted stage after sent text', async () => {
      leadRepositoryInstance.getLead.mockResolvedValue({ ...mockLead, stage: 'new' });
      await leadService.logText('lead1', 'sent', 'Test message', 'user1');
      expect(leadRepositoryInstance.moveToStage).toHaveBeenCalledWith('lead1', 'contacted', 'user1', 'Automatically moved after text');
    });

    it('should not change stage if lead is not new', async () => {
      leadRepositoryInstance.getLead.mockResolvedValue({ ...mockLead, stage: 'contacted' });
      await leadService.logText('lead1', 'sent', 'Test message', 'user1');
      expect(leadRepositoryInstance.moveToStage).not.toHaveBeenCalled();
    });

    it('should not change stage for received texts', async () => {
      leadRepositoryInstance.getLead.mockResolvedValue({ ...mockLead, stage: 'new' });
      await leadService.logText('lead1', 'received', 'Test message', 'user1');
      expect(leadRepositoryInstance.moveToStage).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError if lead not found', async () => {
      leadRepositoryInstance.getLead.mockRejectedValue(new NotFoundError('Lead not found'));
      await expect(leadService.logText('nonexistent', 'sent', 'Test message', 'user1')).rejects.toThrow(NotFoundError);
    });
  });

  describe('logMeeting', () => {
    it('should check if lead exists and log a meeting', async () => {
      leadRepositoryInstance.getLead.mockResolvedValue(mockLead);
      const meetingDate = new Date();
      await leadService.logMeeting('lead1', 'Test meeting', 'user1', meetingDate, 60, ['user1', 'user2']);
      expect(leadRepositoryInstance.getLead).toHaveBeenCalledWith('lead1');
      expect(logLeadMeeting).toHaveBeenCalledWith('lead1', 'Test meeting', 'user1', meetingDate, 60, ['user1', 'user2']);
    });

    it('should move new lead to contacted stage after meeting', async () => {
      leadRepositoryInstance.getLead.mockResolvedValue({ ...mockLead, stage: 'new' });
      await leadService.logMeeting('lead1', 'Test meeting', 'user1', new Date());
      expect(leadRepositoryInstance.moveToStage).toHaveBeenCalledWith('lead1', 'contacted', 'user1', 'Automatically moved after meeting');
    });

    it('should not change stage if lead is not new', async () => {
      leadRepositoryInstance.getLead.mockResolvedValue({ ...mockLead, stage: 'contacted' });
      await leadService.logMeeting('lead1', 'Test meeting', 'user1', new Date());
      expect(leadRepositoryInstance.moveToStage).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError if lead not found', async () => {
      leadRepositoryInstance.getLead.mockRejectedValue(new NotFoundError('Lead not found'));
      await expect(leadService.logMeeting('nonexistent', 'Test meeting', 'user1', new Date())).rejects.toThrow(NotFoundError);
    });
  });

  describe('logEstimate', () => {
    it('should check if lead exists and log an estimate', async () => {
      leadRepositoryInstance.getLead.mockResolvedValue(mockLead);
      await leadService.logEstimate('lead1', 'EST-001', 1000, 'user1');
      expect(leadRepositoryInstance.getLead).toHaveBeenCalledWith('lead1');
      expect(logEstimateSent).toHaveBeenCalledWith('lead1', 'EST-001', 1000, 'user1');
      expect(leadRepositoryInstance.moveToStage).toHaveBeenCalledWith('lead1', 'estimate_sent', 'user1', 'Automatically moved after estimate sent');
    });

    it('should throw NotFoundError if lead not found', async () => {
      leadRepositoryInstance.getLead.mockRejectedValue(new NotFoundError('Lead not found'));
      await expect(leadService.logEstimate('nonexistent', 'EST-001', 1000, 'user1')).rejects.toThrow(NotFoundError);
    });
  });

  describe('setFollowUp', () => {
    it('should check if lead exists and set follow-up date', async () => {
      leadRepositoryInstance.getLead.mockResolvedValue(mockLead);
      const followUpDate = new Date();
      leadRepositoryInstance.setFollowUp.mockResolvedValue({ ...mockLead, followUpDate });
      const result = await leadService.setFollowUp('lead1', followUpDate, 'user1');
      expect(leadRepositoryInstance.getLead).toHaveBeenCalledWith('lead1');
      expect(leadRepositoryInstance.setFollowUp).toHaveBeenCalledWith('lead1', followUpDate);
      expect(result.followUpDate).toEqual(followUpDate);
    });

    it('should throw NotFoundError if lead not found', async () => {
      leadRepositoryInstance.getLead.mockRejectedValue(new NotFoundError('Lead not found'));
      await expect(leadService.setFollowUp('nonexistent', new Date(), 'user1')).rejects.toThrow(NotFoundError);
    });
  });

  describe('clearFollowUp', () => {
    it('should check if lead exists and clear follow-up date', async () => {
      leadRepositoryInstance.getLead.mockResolvedValue(mockLead);
      leadRepositoryInstance.clearFollowUp.mockResolvedValue({ ...mockLead, followUpDate: null });
      const result = await leadService.clearFollowUp('lead1', 'user1');
      expect(leadRepositoryInstance.getLead).toHaveBeenCalledWith('lead1');
      expect(leadRepositoryInstance.clearFollowUp).toHaveBeenCalledWith('lead1');
      expect(result.followUpDate).toBeNull();
    });

    it('should throw NotFoundError if lead not found', async () => {
      leadRepositoryInstance.getLead.mockRejectedValue(new NotFoundError('Lead not found'));
      await expect(leadService.clearFollowUp('nonexistent', 'user1')).rejects.toThrow(NotFoundError);
    });
  });

  describe('getUpcomingFollowUps', () => {
    it('should call leadRepository.getUpcomingFollowUps with provided days', async () => {
      leadRepositoryInstance.getUpcomingFollowUps.mockResolvedValue([mockLead]);
      const result = await leadService.getUpcomingFollowUps(7);
      expect(leadRepositoryInstance.getUpcomingFollowUps).toHaveBeenCalledWith(7);
      expect(result).toEqual([mockLead]);
    });

    it('should use default days if not provided', async () => {
      leadRepositoryInstance.getUpcomingFollowUps.mockResolvedValue([mockLead]);
      await leadService.getUpcomingFollowUps();
      expect(leadRepositoryInstance.getUpcomingFollowUps).toHaveBeenCalledWith(7); // Default is 7
    });
  });

  describe('getOverdueFollowUps', () => {
    it('should call leadRepository.getOverdueFollowUps', async () => {
      leadRepositoryInstance.getOverdueFollowUps.mockResolvedValue([mockLead]);
      const result = await leadService.getOverdueFollowUps();
      expect(leadRepositoryInstance.getOverdueFollowUps).toHaveBeenCalled();
      expect(result).toEqual([mockLead]);
    });
  });

  describe('moveToStage', () => {
    it('should check if lead exists and move to a different stage', async () => {
      leadRepositoryInstance.getLead.mockResolvedValue(mockLead);
      leadRepositoryInstance.moveToStage.mockResolvedValue({ ...mockLead, stage: 'contacted' });
      const result = await leadService.moveToStage('lead1', 'contacted', 'user1', 'Test notes');
      expect(leadRepositoryInstance.getLead).toHaveBeenCalledWith('lead1');
      expect(logStageChange).toHaveBeenCalledWith('lead1', 'new', 'contacted', 'user1', 'Test notes');
      expect(leadRepositoryInstance.moveToStage).toHaveBeenCalledWith('lead1', 'contacted', 'Test notes');
      expect(result.stage).toEqual('contacted');
    });

    it('should not call moveToStage if stage is the same', async () => {
      leadRepositoryInstance.getLead.mockResolvedValue({ ...mockLead, stage: 'contacted' });
      await leadService.moveToStage('lead1', 'contacted', 'user1');
      expect(logStageChange).not.toHaveBeenCalled();
      expect(leadRepositoryInstance.moveToStage).not.toHaveBeenCalled();
    });

    it('should throw NotFoundError if lead not found', async () => {
      leadRepositoryInstance.getLead.mockRejectedValue(new NotFoundError('Lead not found'));
      await expect(leadService.moveToStage('nonexistent', 'contacted', 'user1')).rejects.toThrow(NotFoundError);
    });
  });

  describe('assignLead', () => {
    it('should check if lead exists and assign to user', async () => {
      leadRepositoryInstance.getLead.mockResolvedValue(mockLead);
      leadRepositoryInstance.updateLead.mockResolvedValue({ ...mockLead, assignedTo: 'user2' });
      const result = await leadService.assignLead('lead1', 'user2', 'user1');
      expect(leadRepositoryInstance.getLead).toHaveBeenCalledWith('lead1');
      expect(logLeadAssigned).toHaveBeenCalledWith('lead1', 'user2', 'user1');
      expect(leadRepositoryInstance.updateLead).toHaveBeenCalledWith('lead1', { assignedTo: 'user2' });
      expect(result.assignedTo).toEqual('user2');
    });

    it('should throw NotFoundError if lead not found', async () => {
      leadRepositoryInstance.getLead.mockRejectedValue(new NotFoundError('Lead not found'));
      await expect(leadService.assignLead('nonexistent', 'user2', 'user1')).rejects.toThrow(NotFoundError);
    });
  });

  describe('markAsWon', () => {
    it('should check if lead exists, mark as won, and convert to job', async () => {
      leadRepositoryInstance.getLead.mockResolvedValue(mockLead);
      leadRepositoryInstance.markLeadAsWon.mockResolvedValue({ ...mockLead, stage: 'won', jobId: 'job123' });
      mockJobService.createJob.mockResolvedValue({ id: 'job123', title: 'Test Job' });
      
      const jobData = { title: 'Test Job' };
      const result = await leadService.markAsWon('lead1', 'user1', true, jobData);
      
      expect(leadRepositoryInstance.getLead).toHaveBeenCalledWith('lead1');
      expect(mockJobService.createJob).toHaveBeenCalledWith({
        ...jobData,
        title: 'Test Job',
        description: '',
        serviceType: 'general',
      }, 'user1');
      expect(leadRepositoryInstance.markLeadAsWon).toHaveBeenCalledWith('lead1', 'job123');
      
      expect(result.lead.stage).toEqual('won');
      expect(result.jobId).toEqual('job123');
      expect(result.convertedToJob).toBe(true);
    });

    it('should mark as won without converting to job if convertToJob is false', async () => {
      leadRepositoryInstance.getLead.mockResolvedValue(mockLead);
      leadRepositoryInstance.markLeadAsWon.mockResolvedValue({ ...mockLead, stage: 'won' });
      
      const result = await leadService.markAsWon('lead1', 'user1', false);
      
      expect(leadRepositoryInstance.getLead).toHaveBeenCalledWith('lead1');
      expect(mockJobService.createJob).not.toHaveBeenCalled();
      expect(leadRepositoryInstance.markLeadAsWon).toHaveBeenCalledWith('lead1', undefined);
      
      expect(result.lead.stage).toEqual('won');
      expect(result.jobId).toBeUndefined();
      expect(result.convertedToJob).toBe(false);
    });

    it('should use lead data for job if not provided', async () => {
      leadRepositoryInstance.getLead.mockResolvedValue({
        ...mockLead,
        notes: 'Test notes',
        serviceType: 'fencing'
      });
      leadRepositoryInstance.markLeadAsWon.mockResolvedValue({
        ...mockLead,
        stage: 'won',
        jobId: 'job123'
      });
      mockJobService.createJob.mockResolvedValue({ id: 'job123', title: 'Job for Test Lead' });
      
      await leadService.markAsWon('lead1', 'user1', true);
      
      expect(mockJobService.createJob).toHaveBeenCalledWith({
        title: 'Job for Test Lead',
        description: 'Test notes',
        serviceType: 'fencing',
      }, 'user1');
    });

    it('should throw NotFoundError if lead not found', async () => {
      leadRepositoryInstance.getLead.mockRejectedValue(new NotFoundError('Lead not found'));
      await expect(leadService.markAsWon('nonexistent', 'user1')).rejects.toThrow(NotFoundError);
    });
  });

  describe('markAsLost', () => {
    it('should check if lead exists and mark as lost with reason', async () => {
      leadRepositoryInstance.getLead.mockResolvedValue(mockLead);
      leadRepositoryInstance.markLeadAsLost.mockResolvedValue({ ...mockLead, stage: 'lost' });
      const result = await leadService.markAsLost('lead1', 'user1', 'Too expensive');
      expect(leadRepositoryInstance.getLead).toHaveBeenCalledWith('lead1');
      expect(leadRepositoryInstance.markLeadAsLost).toHaveBeenCalledWith('lead1', 'Too expensive');
      expect(result.stage).toEqual('lost');
    });

    it('should mark as lost without reason', async () => {
      leadRepositoryInstance.getLead.mockResolvedValue(mockLead);
      leadRepositoryInstance.markLeadAsLost.mockResolvedValue({ ...mockLead, stage: 'lost' });
      await leadService.markAsLost('lead1', 'user1');
      expect(leadRepositoryInstance.markLeadAsLost).toHaveBeenCalledWith('lead1', undefined);
    });

    it('should throw NotFoundError if lead not found', async () => {
      leadRepositoryInstance.getLead.mockRejectedValue(new NotFoundError('Lead not found'));
      await expect(leadService.markAsLost('nonexistent', 'user1')).rejects.toThrow(NotFoundError);
    });
  });

  describe('bulkUpdateStage', () => {
    it('should update stage for multiple leads', async () => {
      leadRepositoryInstance.getLead.mockResolvedValueOnce(mockLead);
      leadRepositoryInstance.moveToStage.mockResolvedValueOnce({ ...mockLead, stage: 'contacted' });
      
      const result = await leadService.bulkUpdateStage(['lead1'], 'contacted', 'user1', 'Bulk update');
      
      expect(leadRepositoryInstance.getLead).toHaveBeenCalledWith('lead1');
      expect(logStageChange).toHaveBeenCalledWith('lead1', 'new', 'contacted', 'user1', 'Bulk update');
      expect(leadRepositoryInstance.moveToStage).toHaveBeenCalledWith('lead1', 'contacted', 'Bulk update');
      
      expect(result.results).toHaveLength(1);
      expect(result.results[0].success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle errors for individual leads', async () => {
      leadRepositoryInstance.getLead.mockResolvedValueOnce(mockLead);
      leadRepositoryInstance.moveToStage.mockResolvedValueOnce({ ...mockLead, stage: 'contacted' });
      leadRepositoryInstance.getLead.mockRejectedValueOnce(new NotFoundError('Lead not found'));
      
      const result = await leadService.bulkUpdateStage(['lead1', 'nonexistent'], 'contacted', 'user1');
      
      expect(result.results).toHaveLength(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].id).toBe('nonexistent');
      expect(result.errors[0].success).toBe(false);
    });
  });

  describe('bulkAssign', () => {
    it('should assign multiple leads to a user', async () => {
      leadRepositoryInstance.getLead.mockResolvedValueOnce(mockLead);
      leadRepositoryInstance.updateLead.mockResolvedValueOnce({ ...mockLead, assignedTo: 'user2' });
      
      const result = await leadService.bulkAssign(['lead1'], 'user2', 'user1');
      
      expect(leadRepositoryInstance.getLead).toHaveBeenCalledWith('lead1');
      expect(logLeadAssigned).toHaveBeenCalledWith('lead1', 'user2', 'user1');
      expect(leadRepositoryInstance.updateLead).toHaveBeenCalledWith('lead1', { assignedTo: 'user2' });
      
      expect(result.results).toHaveLength(1);
      expect(result.results[0].success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle errors for individual leads', async () => {
      leadRepositoryInstance.getLead.mockResolvedValueOnce(mockLead);
      leadRepositoryInstance.updateLead.mockResolvedValueOnce({ ...mockLead, assignedTo: 'user2' });
      leadRepositoryInstance.getLead.mockRejectedValueOnce(new NotFoundError('Lead not found'));
      
      const result = await leadService.bulkAssign(['lead1', 'nonexistent'], 'user2', 'user1');
      
      expect(result.results).toHaveLength(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].id).toBe('nonexistent');
      expect(result.errors[0].success).toBe(false);
    });
  });

  describe('bulkDelete', () => {
    it('should delete multiple leads', async () => {
      leadRepositoryInstance.getLead.mockResolvedValueOnce(mockLead);
      leadRepositoryInstance.deleteLead.mockResolvedValueOnce(mockLead);
      
      const result = await leadService.bulkDelete(['lead1'], 'user1');
      
      expect(leadRepositoryInstance.getLead).toHaveBeenCalledWith('lead1');
      expect(logLeadActivity).toHaveBeenCalledWith('lead1', 'deleted', 'Lead deleted', 'user1');
      expect(leadRepositoryInstance.deleteLead).toHaveBeenCalledWith('lead1');
      
      expect(result.results).toHaveLength(1);
      expect(result.results[0].success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should handle errors for individual leads', async () => {
      leadRepositoryInstance.getLead.mockResolvedValueOnce(mockLead);
      leadRepositoryInstance.deleteLead.mockResolvedValueOnce(mockLead);
      leadRepositoryInstance.getLead.mockRejectedValueOnce(new NotFoundError('Lead not found'));
      
      const result = await leadService.bulkDelete(['lead1', 'nonexistent'], 'user1');
      
      expect(result.results).toHaveLength(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].id).toBe('nonexistent');
      expect(result.errors[0].success).toBe(false);
    });
  });

  describe('getLeadStats', () => {
    it('should call db to get lead statistics', async () => {
      const { db } = require('../../db');
      const mockStats = {
        byStage: [{ stage: 'new', count: 5 }],
        bySource: [{ source: 'referral', count: 3 }],
        byServiceType: [{ serviceType: 'fencing', count: 2 }],
      };
      
      // Mock the three separate queries
      db.select.mockReturnValueOnce({
        from: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockResolvedValue(mockStats.byStage)
      });
      
      db.select.mockReturnValueOnce({
        from: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockResolvedValue(mockStats.bySource)
      });
      
      db.select.mockReturnValueOnce({
        from: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockResolvedValue(mockStats.byServiceType)
      });
      
      const result = await leadService.getLeadStats();
      
      expect(db.select).toHaveBeenCalledTimes(3);
      expect(result).toEqual(mockStats);
    });
  });
});
