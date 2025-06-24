import request from 'supertest';
import express from 'express';
import leadsRouter from '../../routes/leads';
import { leadService } from '../../services/leadService';
import { NotFoundError, BadRequestError, ConflictError } from '../../utils/errors';

// Mock the authentication middleware
jest.mock('../../auth-middleware', () => ({
  authenticateUser: jest.fn((req, res, next) => {
    req.user = { id: 'mockUserId' }; // Attach a mock user for testing
    next();
  }),
}));

// Mock the error handler utility
jest.mock('../../utils/errorHandler', () => ({
  handleServiceError: jest.fn((error, res) => {
    if (error instanceof NotFoundError) {
      res.status(404).json({ success: false, message: error.message });
    } else if (error instanceof BadRequestError) {
      res.status(400).json({ success: false, message: error.message });
    } else if (error instanceof ConflictError) {
      res.status(409).json({ success: false, message: error.message });
    } else {
      res.status(500).json({ success: false, message: error.message || 'Internal Server Error' });
    }
  }),
}));

// Mock the leadService
jest.mock('../../services/leadService');
const mockLeadService = leadService as jest.Mocked<typeof leadService>;

const app = express();
app.use(express.json());
app.use('/api/leads', leadsRouter);

describe('Leads API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockLead = {
    id: 'lead1',
    fullName: 'Test Lead',
    phone: '123-456-7890',
    email: 'test@example.com',
    serviceType: 'fencing',
    source: 'website',
    notes: 'Initial inquiry',
    stage: 'new',
    followUpDate: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    assignedTo: null,
  };

  const mockLeadEvent = {
    id: 'event1',
    leadId: 'lead1',
    type: 'created',
    content: 'Lead created',
    createdAt: new Date().toISOString(),
    createdBy: 'mockUserId',
    meta: {},
  };

  describe('GET /api/leads', () => {
    it('should return a list of leads with pagination', async () => {
      mockLeadService.getLeads.mockResolvedValue({
        data: [mockLead],
        pagination: { total: 1, page: 1, limit: 10, pages: 1 },
      });

      const res = await request(app).get('/api/leads?page=1&limit=10');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([mockLead]);
      expect(mockLeadService.getLeads).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        search: undefined,
        stage: undefined,
        source: undefined,
        serviceType: undefined,
        assignedTo: undefined,
        hasFollowUp: undefined,
        sortBy: undefined,
        sortDirection: 'desc',
      });
    });

    it('should filter leads by search query', async () => {
      mockLeadService.getLeads.mockResolvedValue({
        data: [mockLead],
        pagination: { total: 1, page: 1, limit: 10, pages: 1 },
      });

      const res = await request(app).get('/api/leads?search=Test');

      expect(res.statusCode).toEqual(200);
      expect(mockLeadService.getLeads).toHaveBeenCalledWith(expect.objectContaining({ search: 'Test' }));
    });
  });

  describe('GET /api/leads/kanban', () => {
    it('should return leads grouped by stage', async () => {
      mockLeadService.getLeadsByStage.mockResolvedValue({ new: [mockLead] });

      const res = await request(app).get('/api/leads/kanban');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual({ new: [mockLead] });
      expect(mockLeadService.getLeadsByStage).toHaveBeenCalledWith({
        search: undefined,
        source: undefined,
        serviceType: undefined,
        assignedTo: undefined,
      });
    });
  });

  describe('GET /api/leads/follow-ups/upcoming', () => {
    it('should return leads with upcoming follow-ups', async () => {
      mockLeadService.getUpcomingFollowUps.mockResolvedValue([mockLead]);

      const res = await request(app).get('/api/leads/follow-ups/upcoming');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([mockLead]);
      expect(mockLeadService.getUpcomingFollowUps).toHaveBeenCalledWith(7); // Default days
    });

    it('should return leads with upcoming follow-ups for specified days', async () => {
      mockLeadService.getUpcomingFollowUps.mockResolvedValue([mockLead]);

      const res = await request(app).get('/api/leads/follow-ups/upcoming?days=3');

      expect(res.statusCode).toEqual(200);
      expect(mockLeadService.getUpcomingFollowUps).toHaveBeenCalledWith(3);
    });
  });

  describe('GET /api/leads/follow-ups/overdue', () => {
    it('should return leads with overdue follow-ups', async () => {
      mockLeadService.getOverdueFollowUps.mockResolvedValue([mockLead]);

      const res = await request(app).get('/api/leads/follow-ups/overdue');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([mockLead]);
      expect(mockLeadService.getOverdueFollowUps).toHaveBeenCalled();
    });
  });

  describe('GET /api/leads/stats', () => {
    it('should return lead statistics', async () => {
      const mockStats = { byStage: [], bySource: [], byServiceType: [] };
      mockLeadService.getLeadStats.mockResolvedValue(mockStats);

      const res = await request(app).get('/api/leads/stats');

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(mockStats);
      expect(mockLeadService.getLeadStats).toHaveBeenCalled();
    });
  });

  describe('GET /api/leads/:id', () => {
    it('should return a single lead by ID with events', async () => {
      mockLeadService.getLead.mockResolvedValue({ lead: mockLead, events: [mockLeadEvent] });

      const res = await request(app).get(`/api/leads/${mockLead.id}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual({ lead: mockLead, events: [mockLeadEvent] });
      expect(mockLeadService.getLead).toHaveBeenCalledWith(mockLead.id);
    });

    it('should return 404 if lead not found', async () => {
      mockLeadService.getLead.mockRejectedValue(new NotFoundError('Lead not found'));

      const res = await request(app).get('/api/leads/nonexistent');

      expect(res.statusCode).toEqual(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toEqual('Lead not found');
    });
  });

  describe('POST /api/leads', () => {
    const newLeadData = {
      fullName: 'New Lead',
      phone: '987-654-3210',
      email: 'new@example.com',
    };

    it('should create a new lead', async () => {
      mockLeadService.createLead.mockResolvedValue({ lead: mockLead, hasDuplicates: false });

      const res = await request(app).post('/api/leads').send(newLeadData);

      expect(res.statusCode).toEqual(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual(mockLead);
      expect(res.body.message).toEqual('Lead created successfully');
      expect(mockLeadService.createLead).toHaveBeenCalledWith(newLeadData, 'mockUserId');
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = { fullName: '', phone: '123' };
      mockLeadService.createLead.mockRejectedValue(new BadRequestError('Validation failed'));

      const res = await request(app).post('/api/leads').send(invalidData);

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toEqual('Validation failed');
    });

    it('should return duplicate warning if duplicates found', async () => {
      mockLeadService.createLead.mockResolvedValue({
        lead: mockLead,
        hasDuplicates: true,
        duplicates: [{ ...mockLead, id: 'duplicate2' }],
      });

      const res = await request(app).post('/api/leads').send(newLeadData);

      expect(res.statusCode).toEqual(201);
      expect(res.body.hasDuplicates).toBe(true);
      expect(res.body.duplicates).toEqual([{ ...mockLead, id: 'duplicate2' }]);
    });
  });

  describe('PUT /api/leads/:id', () => {
    const updateData = { email: 'updated@example.com' };

    it('should update an existing lead', async () => {
      mockLeadService.updateLead.mockResolvedValue({ lead: { ...mockLead, ...updateData }, hasDuplicates: false });

      const res = await request(app).put(`/api/leads/${mockLead.id}`).send(updateData);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toEqual(updateData.email);
      expect(res.body.message).toEqual('Lead updated successfully');
      expect(mockLeadService.updateLead).toHaveBeenCalledWith(mockLead.id, updateData, 'mockUserId');
    });

    it('should return 404 if lead not found', async () => {
      mockLeadService.updateLead.mockRejectedValue(new NotFoundError('Lead not found'));

      const res = await request(app).put('/api/leads/nonexistent').send(updateData);

      expect(res.statusCode).toEqual(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toEqual('Lead not found');
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = { phone: 'invalid' };
      mockLeadService.updateLead.mockRejectedValue(new BadRequestError('Validation failed'));

      const res = await request(app).put(`/api/leads/${mockLead.id}`).send(invalidData);

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toEqual('Validation failed');
    });

    it('should return duplicate warning if duplicates found', async () => {
      mockLeadService.updateLead.mockResolvedValue({
        lead: { ...mockLead, ...updateData },
        hasDuplicates: true,
        duplicates: [{ ...mockLead, id: 'duplicate2' }],
      });

      const res = await request(app).put(`/api/leads/${mockLead.id}`).send(updateData);

      expect(res.statusCode).toEqual(200);
      expect(res.body.hasDuplicates).toBe(true);
      expect(res.body.duplicates).toEqual([{ ...mockLead, id: 'duplicate2' }]);
    });
  });

  describe('DELETE /api/leads/:id', () => {
    it('should delete a lead', async () => {
      mockLeadService.deleteLead.mockResolvedValue(mockLead);

      const res = await request(app).delete(`/api/leads/${mockLead.id}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toEqual('Lead deleted successfully');
      expect(mockLeadService.deleteLead).toHaveBeenCalledWith(mockLead.id, 'mockUserId');
    });

    it('should return 404 if lead not found', async () => {
      mockLeadService.deleteLead.mockRejectedValue(new NotFoundError('Lead not found'));

      const res = await request(app).delete('/api/leads/nonexistent');

      expect(res.statusCode).toEqual(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toEqual('Lead not found');
    });
  });

  describe('POST /api/leads/:id/note', () => {
    it('should add a note to a lead', async () => {
      mockLeadService.addNote.mockResolvedValue({ success: true });
      const noteData = { note: 'Test note' };

      const res = await request(app).post(`/api/leads/${mockLead.id}/note`).send(noteData);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toEqual('Note added successfully');
      expect(mockLeadService.addNote).toHaveBeenCalledWith(mockLead.id, 'Test note', 'mockUserId');
    });

    it('should return 400 if note is missing', async () => {
      const res = await request(app).post(`/api/leads/${mockLead.id}/note`).send({});

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toEqual('Note content is required');
    });

    it('should return 404 if lead not found', async () => {
      mockLeadService.addNote.mockRejectedValue(new NotFoundError('Lead not found'));
      const noteData = { note: 'Test note' };

      const res = await request(app).post('/api/leads/nonexistent/note').send(noteData);

      expect(res.statusCode).toEqual(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toEqual('Lead not found');
    });
  });

  describe('POST /api/leads/:id/call', () => {
    it('should log a call with a lead', async () => {
      mockLeadService.logCall.mockResolvedValue({ success: true });
      const callData = { notes: 'Test call', duration: 60, outcome: 'Left voicemail' };

      const res = await request(app).post(`/api/leads/${mockLead.id}/call`).send(callData);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toEqual('Call logged successfully');
      expect(mockLeadService.logCall).toHaveBeenCalledWith(
        mockLead.id,
        'Test call',
        'mockUserId',
        60,
        'Left voicemail'
      );
    });

    it('should return 400 if notes are missing', async () => {
      const res = await request(app).post(`/api/leads/${mockLead.id}/call`).send({});

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toEqual('Call notes are required');
    });

    it('should return 404 if lead not found', async () => {
      mockLeadService.logCall.mockRejectedValue(new NotFoundError('Lead not found'));
      const callData = { notes: 'Test call' };

      const res = await request(app).post('/api/leads/nonexistent/call').send(callData);

      expect(res.statusCode).toEqual(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toEqual('Lead not found');
    });
  });

  describe('POST /api/leads/:id/email', () => {
    it('should log an email with a lead', async () => {
      mockLeadService.logEmail.mockResolvedValue({ success: true });
      const emailData = {
        direction: 'sent',
        subject: 'Test subject',
        emailContent: 'Test content',
      };

      const res = await request(app).post(`/api/leads/${mockLead.id}/email`).send(emailData);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toEqual('Email logged successfully');
      expect(mockLeadService.logEmail).toHaveBeenCalledWith(
        mockLead.id,
        'sent',
        'Test subject',
        'mockUserId',
        'Test content'
      );
    });

    it('should return 400 if direction or subject is missing', async () => {
      const res = await request(app).post(`/api/leads/${mockLead.id}/email`).send({});

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toEqual('Direction and subject are required');
    });

    it('should return 400 if direction is invalid', async () => {
      const emailData = {
        direction: 'invalid',
        subject: 'Test subject',
      };

      const res = await request(app).post(`/api/leads/${mockLead.id}/email`).send(emailData);

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toEqual('Direction must be "sent" or "received"');
    });

    it('should return 404 if lead not found', async () => {
      mockLeadService.logEmail.mockRejectedValue(new NotFoundError('Lead not found'));
      const emailData = {
        direction: 'sent',
        subject: 'Test subject',
      };

      const res = await request(app).post('/api/leads/nonexistent/email').send(emailData);

      expect(res.statusCode).toEqual(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toEqual('Lead not found');
    });
  });

  describe('POST /api/leads/:id/text', () => {
    it('should log a text message with a lead', async () => {
      mockLeadService.logText.mockResolvedValue({ success: true });
      const textData = {
        direction: 'sent',
        message: 'Test message',
      };

      const res = await request(app).post(`/api/leads/${mockLead.id}/text`).send(textData);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toEqual('Text message logged successfully');
      expect(mockLeadService.logText).toHaveBeenCalledWith(
        mockLead.id,
        'sent',
        'Test message',
        'mockUserId'
      );
    });

    it('should return 400 if direction or message is missing', async () => {
      const res = await request(app).post(`/api/leads/${mockLead.id}/text`).send({});

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toEqual('Direction and message are required');
    });

    it('should return 400 if direction is invalid', async () => {
      const textData = {
        direction: 'invalid',
        message: 'Test message',
      };

      const res = await request(app).post(`/api/leads/${mockLead.id}/text`).send(textData);

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toEqual('Direction must be "sent" or "received"');
    });

    it('should return 404 if lead not found', async () => {
      mockLeadService.logText.mockRejectedValue(new NotFoundError('Lead not found'));
      const textData = {
        direction: 'sent',
        message: 'Test message',
      };

      const res = await request(app).post('/api/leads/nonexistent/text').send(textData);

      expect(res.statusCode).toEqual(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toEqual('Lead not found');
    });
  });

  describe('POST /api/leads/:id/meeting', () => {
    it('should log a meeting with a lead', async () => {
      mockLeadService.logMeeting.mockResolvedValue({ success: true });
      const meetingData = {
        summary: 'Test meeting',
        date: new Date().toISOString(),
        duration: 60,
        attendees: ['User 1', 'User 2'],
      };

      const res = await request(app).post(`/api/leads/${mockLead.id}/meeting`).send(meetingData);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toEqual('Meeting logged successfully');
      expect(mockLeadService.logMeeting).toHaveBeenCalledWith(
        mockLead.id,
        'Test meeting',
        'mockUserId',
        expect.any(Date),
        60,
        ['User 1', 'User 2']
      );
    });

    it('should return 400 if summary or date is missing', async () => {
      const res = await request(app).post(`/api/leads/${mockLead.id}/meeting`).send({});

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toEqual('Summary and date are required');
    });

    it('should return 404 if lead not found', async () => {
      mockLeadService.logMeeting.mockRejectedValue(new NotFoundError('Lead not found'));
      const meetingData = {
        summary: 'Test meeting',
        date: new Date().toISOString(),
      };

      const res = await request(app).post('/api/leads/nonexistent/meeting').send(meetingData);

      expect(res.statusCode).toEqual(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toEqual('Lead not found');
    });
  });

  describe('POST /api/leads/:id/estimate', () => {
    it('should log an estimate sent to a lead', async () => {
      mockLeadService.logEstimate.mockResolvedValue({ success: true });
      const estimateData = {
        estimateId: 'EST-001',
        amount: 1000,
      };

      const res = await request(app).post(`/api/leads/${mockLead.id}/estimate`).send(estimateData);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toEqual('Estimate logged successfully');
      expect(mockLeadService.logEstimate).toHaveBeenCalledWith(
        mockLead.id,
        'EST-001',
        1000,
        'mockUserId'
      );
    });

    it('should return 400 if estimateId or amount is missing', async () => {
      const res = await request(app).post(`/api/leads/${mockLead.id}/estimate`).send({});

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toEqual('Estimate ID and amount are required');
    });

    it('should return 404 if lead not found', async () => {
      mockLeadService.logEstimate.mockRejectedValue(new NotFoundError('Lead not found'));
      const estimateData = {
        estimateId: 'EST-001',
        amount: 1000,
      };

      const res = await request(app).post('/api/leads/nonexistent/estimate').send(estimateData);

      expect(res.statusCode).toEqual(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toEqual('Lead not found');
    });
  });

  describe('POST /api/leads/:id/stage', () => {
    it('should move a lead to a different stage', async () => {
      mockLeadService.moveToStage.mockResolvedValue({ ...mockLead, stage: 'contacted' });
      const stageData = {
        stage: 'contacted',
        notes: 'Moving to contacted stage',
      };

      const res = await request(app).post(`/api/leads/${mockLead.id}/stage`).send(stageData);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.stage).toEqual('contacted');
      expect(res.body.message).toEqual('Lead stage updated successfully');
      expect(mockLeadService.moveToStage).toHaveBeenCalledWith(
        mockLead.id,
        'contacted',
        'mockUserId',
        'Moving to contacted stage'
      );
    });

    it('should return 400 if stage is missing', async () => {
      const res = await request(app).post(`/api/leads/${mockLead.id}/stage`).send({});

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toEqual('Stage is required');
    });

    it('should return 400 if stage is invalid', async () => {
      const stageData = {
        stage: 'invalid-stage',
      };

      const res = await request(app).post(`/api/leads/${mockLead.id}/stage`).send(stageData);

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Stage must be one of:/);
    });

    it('should return 404 if lead not found', async () => {
      mockLeadService.moveToStage.mockRejectedValue(new NotFoundError('Lead not found'));
      const stageData = {
        stage: 'contacted',
      };

      const res = await request(app).post('/api/leads/nonexistent/stage').send(stageData);

      expect(res.statusCode).toEqual(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toEqual('Lead not found');
    });
  });

  describe('POST /api/leads/:id/win', () => {
    it('should mark a lead as won and convert to job', async () => {
      mockLeadService.markAsWon.mockResolvedValue({
        lead: { ...mockLead, stage: 'won' },
        jobId: 'job123',
        convertedToJob: true,
      });

      const res = await request(app).post(`/api/leads/${mockLead.id}/win`).send({
        convertToJob: true,
        jobData: { title: 'New Job' },
      });

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.stage).toEqual('won');
      expect(res.body.jobId).toEqual('job123');
      expect(res.body.convertedToJob).toBe(true);
      expect(res.body.message).toEqual('Lead marked as won and converted to job');
      expect(mockLeadService.markAsWon).toHaveBeenCalledWith(
        mockLead.id,
        'mockUserId',
        true,
        { title: 'New Job' }
      );
    });

    it('should mark a lead as won without converting to job', async () => {
      mockLeadService.markAsWon.mockResolvedValue({
        lead: { ...mockLead, stage: 'won' },
        jobId: undefined,
        convertedToJob: false,
      });

      const res = await request(app).post(`/api/leads/${mockLead.id}/win`).send({
        convertToJob: false,
      });

      expect(res.statusCode).toEqual(200);
      expect(res.body.convertedToJob).toBe(false);
      expect(res.body.message).toEqual('Lead marked as won');
      expect(mockLeadService.markAsWon).toHaveBeenCalledWith(
        mockLead.id,
        'mockUserId',
        false,
        {}
      );
    });

    it('should return 404 if lead not found', async () => {
      mockLeadService.markAsWon.mockRejectedValue(new NotFoundError('Lead not found'));

      const res = await request(app).post('/api/leads/nonexistent/win').send({});

      expect(res.statusCode).toEqual(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toEqual('Lead not found');
    });
  });

  describe('POST /api/leads/:id/loss', () => {
    it('should mark a lead as lost with reason', async () => {
      mockLeadService.markAsLost.mockResolvedValue({ ...mockLead, stage: 'lost' });
      const lossData = {
        reason: 'Too expensive',
      };

      const res = await request(app).post(`/api/leads/${mockLead.id}/loss`).send(lossData);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.stage).toEqual('lost');
      expect(res.body.message).toEqual('Lead marked as lost');
      expect(mockLeadService.markAsLost).toHaveBeenCalledWith(
        mockLead.id,
        'mockUserId',
        'Too expensive'
      );
    });

    it('should mark a lead as lost without reason', async () => {
      mockLeadService.markAsLost.mockResolvedValue({ ...mockLead, stage: 'lost' });

      const res = await request(app).post(`/api/leads/${mockLead.id}/loss`).send({});

      expect(res.statusCode).toEqual(200);
      expect(mockLeadService.markAsLost).toHaveBeenCalledWith(
        mockLead.id,
        'mockUserId',
        undefined
      );
    });

    it('should return 404 if lead not found', async () => {
      mockLeadService.markAsLost.mockRejectedValue(new NotFoundError('Lead not found'));

      const res = await request(app).post('/api/leads/nonexistent/loss').send({});

      expect(res.statusCode).toEqual(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toEqual('Lead not found');
    });
  });

  describe('POST /api/leads/:id/follow-up', () => {
    it('should set a follow-up date for a lead', async () => {
      const followUpDate = new Date();
      mockLeadService.setFollowUp.mockResolvedValue({ ...mockLead, followUpDate });
      const followUpData = {
        followUpDate: followUpDate.toISOString(),
      };

      const res = await request(app).post(`/api/leads/${mockLead.id}/follow-up`).send(followUpData);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toEqual('Follow-up date set successfully');
      expect(mockLeadService.setFollowUp).toHaveBeenCalledWith(
        mockLead.id,
        expect.any(Date),
        'mockUserId'
      );
    });

    it('should return 400 if follow-up date is missing', async () => {
      const res = await request(app).post(`/api/leads/${mockLead.id}/follow-up`).send({});

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toEqual('Follow-up date is required');
    });

    it('should return 404 if lead not found', async () => {
      mockLeadService.setFollowUp.mockRejectedValue(new NotFoundError('Lead not found'));
      const followUpData = {
        followUpDate: new Date().toISOString(),
      };

      const res = await request(app).post('/api/leads/nonexistent/follow-up').send(followUpData);

      expect(res.statusCode).toEqual(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toEqual('Lead not found');
    });
  });

  describe('DELETE /api/leads/:id/follow-up', () => {
    it('should clear the follow-up date for a lead', async () => {
      mockLeadService.clearFollowUp.mockResolvedValue({ ...mockLead, followUpDate: null });

      const res = await request(app).delete(`/api/leads/${mockLead.id}/follow-up`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toEqual('Follow-up date cleared successfully');
      expect(mockLeadService.clearFollowUp).toHaveBeenCalledWith(mockLead.id, 'mockUserId');
    });

    it('should return 404 if lead not found', async () => {
      mockLeadService.clearFollowUp.mockRejectedValue(new NotFoundError('Lead not found'));

      const res = await request(app).delete('/api/leads/nonexistent/follow-up');

      expect(res.statusCode).toEqual(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toEqual('Lead not found');
    });
  });

  describe('POST /api/leads/:id/assign', () => {
    it('should assign a lead to a user', async () => {
      mockLeadService.assignLead.mockResolvedValue({ ...mockLead, assignedTo: 'user123' });
      const assignData = {
        assignedToUserId: 'user123',
      };

      const res = await request(app).post(`/api/leads/${mockLead.id}/assign`).send(assignData);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.assignedTo).toEqual('user123');
      expect(res.body.message).toEqual('Lead assigned successfully');
      expect(mockLeadService.assignLead).toHaveBeenCalledWith(
        mockLead.id,
        'user123',
        'mockUserId'
      );
    });

    it('should return 400 if assignedToUserId is missing', async () => {
      const res = await request(app).post(`/api/leads/${mockLead.id}/assign`).send({});

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toEqual('Assigned user ID is required');
    });

    it('should return 404 if lead not found', async () => {
      mockLeadService.assignLead.mockRejectedValue(new NotFoundError('Lead not found'));
      const assignData = {
        assignedToUserId: 'user123',
      };

      const res = await request(app).post('/api/leads/nonexistent/assign').send(assignData);

      expect(res.statusCode).toEqual(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toEqual('Lead not found');
    });
  });

  describe('POST /api/leads/bulk/stage', () => {
    it('should update stage for multiple leads', async () => {
      mockLeadService.bulkUpdateStage.mockResolvedValue({
        results: [{ id: 'lead1', success: true }],
        errors: [],
      });
      const bulkData = {
        ids: ['lead1', 'lead2'],
        stage: 'contacted',
        notes: 'Bulk update',
      };

      const res = await request(app).post('/api/leads/bulk/stage').send(bulkData);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.results).toHaveLength(1);
      expect(res.body.data.errors).toHaveLength(0);
      expect(res.body.message).toEqual('Updated 1 leads to stage "contacted"');
      expect(mockLeadService.bulkUpdateStage).toHaveBeenCalledWith(
        ['lead1', 'lead2'],
        'contacted',
        'mockUserId',
        'Bulk update'
      );
    });

    it('should return 400 if ids array is missing', async () => {
      const res = await request(app).post('/api/leads/bulk/stage').send({
        stage: 'contacted',
      });

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toEqual('Lead IDs array is required');
    });

    it('should return 400 if stage is missing', async () => {
      const res = await request(app).post('/api/leads/bulk/stage').send({
        ids: ['lead1', 'lead2'],
      });

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toEqual('Stage is required');
    });

    it('should return 400 if stage is invalid', async () => {
      const res = await request(app).post('/api/leads/bulk/stage').send({
        ids: ['lead1', 'lead2'],
        stage: 'invalid-stage',
      });

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Stage must be one of:/);
    });
  });

  describe('POST /api/leads/bulk/assign', () => {
    it('should assign multiple leads to a user', async () => {
      mockLeadService.bulkAssign.mockResolvedValue({
        results: [{ id: 'lead1', success: true }],
        errors: [],
      });
      const bulkData = {
        ids: ['lead1', 'lead2'],
        assignedToUserId: 'user123',
      };

      const res = await request(app).post('/api/leads/bulk/assign').send(bulkData);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.results).toHaveLength(1);
      expect(res.body.data.errors).toHaveLength(0);
      expect(res.body.message).toEqual('Assigned 1 leads to user');
      expect(mockLeadService.bulkAssign).toHaveBeenCalledWith(
        ['lead1', 'lead2'],
        'user123',
        'mockUserId'
      );
    });

    it('should return 400 if ids array is missing', async () => {
      const res = await request(app).post('/api/leads/bulk/assign').send({
        assignedToUserId: 'user123',
      });

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toEqual('Lead IDs array is required');
    });

    it('should return 400 if assignedToUserId is missing', async () => {
      const res = await request(app).post('/api/leads/bulk/assign').send({
        ids: ['lead1', 'lead2'],
      });

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toEqual('Assigned user ID is required');
    });
  });

  describe('POST /api/leads/bulk/delete', () => {
    it('should delete multiple leads', async () => {
      mockLeadService.bulkDelete.mockResolvedValue({
        results: [{ id: 'lead1', success: true }],
        errors: [],
      });
      const bulkData = {
        ids: ['lead1', 'lead2'],
      };

      const res = await request(app).post('/api/leads/bulk/delete').send(bulkData);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.results).toHaveLength(1);
      expect(res.body.data.errors).toHaveLength(0);
      expect(res.body.message).toEqual('Deleted 1 leads');
      expect(mockLeadService.bulkDelete).toHaveBeenCalledWith(
        ['lead1', 'lead2'],
        'mockUserId'
      );
    });

    it('should return 400 if ids array is missing', async () => {
      const res = await request(app).post('/api/leads/bulk/delete').send({});

      expect(res.statusCode).toEqual(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toEqual('Lead IDs array is required');
    });
  });
});
