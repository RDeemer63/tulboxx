import { LeadRepository } from '../../repositories/leadRepository';
import { NotFoundError } from '../../utils/errors';
import { leads, leadEvents } from '../../../shared/schema';
import { eq, ilike, and, or, inArray, asc, desc, sql } from 'drizzle-orm';

// Mock the Drizzle ORM db instance
const mockDb = {
  select: jest.fn(() => mockDb),
  from: jest.fn(() => mockDb),
  where: jest.fn(() => mockDb),
  orderBy: jest.fn(() => mockDb),
  limit: jest.fn(() => mockDb),
  offset: jest.fn(() => mockDb),
  insert: jest.fn(() => mockDb),
  values: jest.fn(() => mockDb),
  returning: jest.fn(() => mockDb),
  update: jest.fn(() => mockDb),
  set: jest.fn(() => mockDb),
  delete: jest.fn(() => mockDb),
  execute: jest.fn(() => mockDb),
  transaction: jest.fn((callback) => callback(mockDb)), // Mock transaction to execute callback
};

// Mock the db import
jest.mock('../../db', () => ({
  db: mockDb,
}));

// Mock the schema imports to ensure they are treated as objects for testing
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

const leadRepository = new LeadRepository();

describe('LeadRepository', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockLeads = [
    {
      id: 'lead1',
      fullName: 'Alice Smith',
      phone: '111-222-3333',
      email: 'alice@example.com',
      serviceType: 'fencing',
      source: 'referral',
      notes: 'Needs new fence',
      stage: 'new',
      followUpDate: null,
      createdAt: new Date('2024-01-01T10:00:00Z'),
      updatedAt: new Date('2024-01-01T10:00:00Z'),
      assignedTo: null,
      originContactId: null,
      jobId: null,
    },
    {
      id: 'lead2',
      fullName: 'Bob Johnson',
      phone: '444-555-6666',
      email: 'bob@example.com',
      serviceType: 'landscaping',
      source: 'google',
      notes: 'Interested in garden design',
      stage: 'contacted',
      followUpDate: new Date('2024-07-01T10:00:00Z'),
      createdAt: new Date('2024-01-05T11:00:00Z'),
      updatedAt: new Date('2024-01-05T11:00:00Z'),
      assignedTo: 'user1',
      originContactId: null,
      jobId: null,
    },
    {
      id: 'lead3',
      fullName: 'Charlie Brown',
      phone: '777-888-9999',
      email: 'charlie@example.com',
      serviceType: 'septic',
      source: 'facebook',
      notes: 'Septic tank inspection',
      stage: 'estimate_sent',
      followUpDate: new Date('2024-06-10T10:00:00Z'), // Past date
      createdAt: new Date('2024-02-01T12:00:00Z'),
      updatedAt: new Date('2024-02-01T12:00:00Z'),
      assignedTo: null,
      originContactId: null,
      jobId: null,
    },
    {
      id: 'lead4',
      fullName: 'Diana Prince',
      phone: '123-456-7890',
      email: 'diana@example.com',
      serviceType: 'fencing',
      source: 'referral',
      notes: 'New fence installation',
      stage: 'won',
      followUpDate: null,
      createdAt: new Date('2024-03-01T13:00:00Z'),
      updatedAt: new Date('2024-03-01T13:00:00Z'),
      assignedTo: 'user2',
      originContactId: null,
      jobId: 'job123',
    },
  ];

  const mockLeadEvents = [
    {
      id: 'event1',
      leadId: 'lead1',
      type: 'created',
      content: 'Lead created',
      createdAt: new Date('2024-01-01T10:00:00Z'),
      createdBy: 'user0',
      meta: {},
    },
    {
      id: 'event2',
      leadId: 'lead1',
      type: 'note',
      content: 'Called, left voicemail',
      createdAt: new Date('2024-01-02T10:00:00Z'),
      createdBy: 'user0',
      meta: {},
    },
  ];

  // Helper to mock db.select().from().where()... calls
  const mockDbResult = (result: any[]) => {
    mockDb.select.mockReturnThis();
    mockDb.from.mockReturnThis();
    mockDb.where.mockReturnThis();
    mockDb.orderBy.mockReturnThis();
    mockDb.limit.mockReturnThis();
    mockDb.offset.mockReturnThis();
    mockDb.execute.mockResolvedValue(result); // For raw SQL queries
    mockDb.returning.mockResolvedValue(result); // For insert/update/delete returning
    return mockDb;
  };

  describe('createLead', () => {
    it('should create a new lead with default stage if not specified', async () => {
      const newLeadData = {
        fullName: 'New Lead',
        phone: '123-456-7890',
        email: 'new@example.com',
      };
      const expectedLead = { ...newLeadData, id: 'newLeadId', stage: 'new' };

      mockDbResult([expectedLead]);

      const result = await leadRepository.createLead(newLeadData);

      expect(mockDb.insert).toHaveBeenCalledWith(leads);
      expect(mockDb.values).toHaveBeenCalledWith({ ...newLeadData, stage: 'new' });
      expect(mockDb.returning).toHaveBeenCalled();
      expect(result).toEqual(expectedLead);
    });

    it('should create a new lead with specified stage', async () => {
      const newLeadData = {
        fullName: 'New Lead',
        phone: '123-456-7890',
        email: 'new@example.com',
        stage: 'contacted',
      };
      const expectedLead = { ...newLeadData, id: 'newLeadId' };

      mockDbResult([expectedLead]);

      const result = await leadRepository.createLead(newLeadData);

      expect(mockDb.insert).toHaveBeenCalledWith(leads);
      expect(mockDb.values).toHaveBeenCalledWith(newLeadData);
      expect(mockDb.returning).toHaveBeenCalled();
      expect(result).toEqual(expectedLead);
    });
  });

  describe('getLead', () => {
    it('should return a lead if found', async () => {
      mockDbResult([mockLeads[0]]);

      const result = await leadRepository.getLead('lead1');

      expect(mockDb.select).toHaveBeenCalledWith();
      expect(mockDb.from).toHaveBeenCalledWith(leads);
      expect(mockDb.where).toHaveBeenCalledWith(eq(leads.id, 'lead1'));
      expect(result).toEqual(mockLeads[0]);
    });

    it('should throw NotFoundError if lead not found', async () => {
      mockDbResult([]);

      await expect(leadRepository.getLead('nonexistent')).rejects.toThrow(
        new NotFoundError('Lead with ID nonexistent not found')
      );
    });
  });

  describe('updateLead', () => {
    it('should update a lead and return the updated lead', async () => {
      const updateData = { email: 'updated@example.com' };
      const expectedLead = { ...mockLeads[0], ...updateData };

      mockDbResult([expectedLead]);

      const result = await leadRepository.updateLead('lead1', updateData);

      expect(mockDb.update).toHaveBeenCalledWith(leads);
      expect(mockDb.set).toHaveBeenCalledWith(expect.objectContaining(updateData));
      expect(mockDb.where).toHaveBeenCalledWith(eq(leads.id, 'lead1'));
      expect(mockDb.returning).toHaveBeenCalled();
      expect(result).toEqual(expectedLead);
    });

    it('should throw NotFoundError if lead to update not found', async () => {
      mockDbResult([]);

      await expect(leadRepository.updateLead('nonexistent', { email: 'test@test.com' })).rejects.toThrow(
        new NotFoundError('Lead with ID nonexistent not found')
      );
    });
  });

  describe('deleteLead', () => {
    it('should delete a lead and its events', async () => {
      mockDbResult([mockLeads[0]]); // Mock returning the deleted lead

      const result = await leadRepository.deleteLead('lead1');

      expect(mockDb.delete).toHaveBeenCalledWith(leadEvents);
      expect(mockDb.where).toHaveBeenCalledWith(eq(leadEvents.leadId, 'lead1'));
      expect(mockDb.delete).toHaveBeenCalledWith(leads);
      expect(mockDb.where).toHaveBeenCalledWith(eq(leads.id, 'lead1'));
      expect(mockDb.returning).toHaveBeenCalled();
      expect(result).toEqual(mockLeads[0]);
    });

    it('should throw NotFoundError if lead to delete not found', async () => {
      mockDbResult([]);

      await expect(leadRepository.deleteLead('nonexistent')).rejects.toThrow(
        new NotFoundError('Lead with ID nonexistent not found')
      );
    });
  });

  describe('getLeads', () => {
    it('should return all leads with default pagination', async () => {
      mockDbResult(mockLeads);
      mockDb.select.mockReturnValueOnce({ from: () => ({ where: () => [{ count: mockLeads.length }] }) }); // Mock count

      const result = await leadRepository.getLeads({});

      expect(mockDb.select).toHaveBeenCalledWith();
      expect(mockDb.from).toHaveBeenCalledWith(leads);
      expect(mockDb.orderBy).toHaveBeenCalledWith(desc(leads.createdAt));
      expect(mockDb.limit).toHaveBeenCalledWith(50);
      expect(mockDb.offset).toHaveBeenCalledWith(0);
      expect(result.data).toEqual(mockLeads);
      expect(result.pagination.total).toEqual(mockLeads.length);
    });

    it('should filter leads by search query', async () => {
      mockDbResult([mockLeads[0]]);
      mockDb.select.mockReturnValueOnce({ from: () => ({ where: () => [{ count: 1 }] }) }); // Mock count

      const result = await leadRepository.getLeads({ search: 'Alice' });

      expect(mockDb.where).toHaveBeenCalledWith(
        or(
          ilike(leads.fullName, '%Alice%'),
          ilike(leads.email, '%Alice%'),
          ilike(leads.phone, '%Alice%'),
          ilike(leads.notes, '%Alice%')
        )
      );
      expect(result.data).toEqual([mockLeads[0]]);
    });

    it('should filter leads by single stage', async () => {
      mockDbResult([mockLeads[0]]);
      mockDb.select.mockReturnValueOnce({ from: () => ({ where: () => [{ count: 1 }] }) }); // Mock count

      const result = await leadRepository.getLeads({ stage: 'new' });

      expect(mockDb.where).toHaveBeenCalledWith(eq(leads.stage, 'new'));
      expect(result.data).toEqual([mockLeads[0]]);
    });

    it('should filter leads by multiple stages', async () => {
      mockDbResult([mockLeads[0], mockLeads[1]]);
      mockDb.select.mockReturnValueOnce({ from: () => ({ where: () => [{ count: 2 }] }) }); // Mock count

      const result = await leadRepository.getLeads({ stage: ['new', 'contacted'] });

      expect(mockDb.where).toHaveBeenCalledWith(inArray(leads.stage, ['new', 'contacted']));
      expect(result.data).toEqual([mockLeads[0], mockLeads[1]]);
    });

    it('should filter leads by source', async () => {
      mockDbResult([mockLeads[0], mockLeads[3]]);
      mockDb.select.mockReturnValueOnce({ from: () => ({ where: () => [{ count: 2 }] }) }); // Mock count

      const result = await leadRepository.getLeads({ source: 'referral' });

      expect(mockDb.where).toHaveBeenCalledWith(eq(leads.source, 'referral'));
      expect(result.data).toEqual([mockLeads[0], mockLeads[3]]);
    });

    it('should filter leads by service type', async () => {
      mockDbResult([mockLeads[0], mockLeads[3]]);
      mockDb.select.mockReturnValueOnce({ from: () => ({ where: () => [{ count: 2 }] }) }); // Mock count

      const result = await leadRepository.getLeads({ serviceType: 'fencing' });

      expect(mockDb.where).toHaveBeenCalledWith(eq(leads.serviceType, 'fencing'));
      expect(result.data).toEqual([mockLeads[0], mockLeads[3]]);
    });

    it('should filter leads by assignedTo', async () => {
      mockDbResult([mockLeads[1]]);
      mockDb.select.mockReturnValueOnce({ from: () => ({ where: () => [{ count: 1 }] }) }); // Mock count

      const result = await leadRepository.getLeads({ assignedTo: 'user1' });

      expect(mockDb.where).toHaveBeenCalledWith(eq(leads.assignedTo, 'user1'));
      expect(result.data).toEqual([mockLeads[1]]);
    });

    it('should filter leads by hasFollowUp=true', async () => {
      mockDbResult([mockLeads[1], mockLeads[2]]);
      mockDb.select.mockReturnValueOnce({ from: () => ({ where: () => [{ count: 2 }] }) }); // Mock count

      const result = await leadRepository.getLeads({ hasFollowUp: true });

      expect(mockDb.where).toHaveBeenCalledWith(sql`${leads.followUpDate} IS NOT NULL`);
      expect(result.data).toEqual([mockLeads[1], mockLeads[2]]);
    });

    it('should filter leads by hasFollowUp=false', async () => {
      mockDbResult([mockLeads[0], mockLeads[3]]);
      mockDb.select.mockReturnValueOnce({ from: () => ({ where: () => [{ count: 2 }] }) }); // Mock count

      const result = await leadRepository.getLeads({ hasFollowUp: false });

      expect(mockDb.where).toHaveBeenCalledWith(sql`${leads.followUpDate} IS NULL`);
      expect(result.data).toEqual([mockLeads[0], mockLeads[3]]);
    });

    it('should sort leads by specified field and direction', async () => {
      mockDbResult(mockLeads);
      mockDb.select.mockReturnValueOnce({ from: () => ({ where: () => [{ count: mockLeads.length }] }) }); // Mock count

      const result = await leadRepository.getLeads({ sortBy: 'fullName', sortDirection: 'asc' });

      expect(mockDb.orderBy).toHaveBeenCalledWith(asc(leads.fullName));
      expect(result.data).toEqual(mockLeads);
    });

    it('should apply pagination correctly', async () => {
      mockDbResult(mockLeads.slice(0, 2));
      mockDb.select.mockReturnValueOnce({ from: () => ({ where: () => [{ count: mockLeads.length }] }) }); // Mock count

      const result = await leadRepository.getLeads({ page: 1, limit: 2 });

      expect(mockDb.limit).toHaveBeenCalledWith(2);
      expect(mockDb.offset).toHaveBeenCalledWith(0);
      expect(result.data).toEqual(mockLeads.slice(0, 2));
      expect(result.pagination).toEqual({
        total: mockLeads.length,
        page: 1,
        limit: 2,
        pages: 2,
      });
    });

    it('should apply multiple filters together', async () => {
      mockDbResult([mockLeads[0]]);
      mockDb.select.mockReturnValueOnce({ from: () => ({ where: () => [{ count: 1 }] }) }); // Mock count

      await leadRepository.getLeads({
        stage: 'new',
        source: 'referral',
        serviceType: 'fencing',
      });

      // We can't easily test the exact combined filter, but we can verify that where was called
      expect(mockDb.where).toHaveBeenCalled();
    });
  });

  describe('getLeadsByStage', () => {
    it('should group leads by stage for Kanban view', async () => {
      mockDbResult(mockLeads);

      const result = await leadRepository.getLeadsByStage({});

      expect(mockDb.select).toHaveBeenCalledWith();
      expect(mockDb.from).toHaveBeenCalledWith(leads);
      expect(mockDb.orderBy).toHaveBeenCalledWith(desc(leads.updatedAt));
      
      // Check that leads are grouped correctly by stage
      expect(result).toHaveProperty('new');
      expect(result).toHaveProperty('contacted');
      expect(result).toHaveProperty('estimate_sent');
      expect(result).toHaveProperty('won');
      expect(result).toHaveProperty('lost');
      
      // Check that the leads are in the right groups
      expect(result.new).toContainEqual(mockLeads[0]);
      expect(result.contacted).toContainEqual(mockLeads[1]);
      expect(result.estimate_sent).toContainEqual(mockLeads[2]);
      expect(result.won).toContainEqual(mockLeads[3]);
    });

    it('should filter leads by search in Kanban view', async () => {
      mockDbResult([mockLeads[0]]);

      await leadRepository.getLeadsByStage({ search: 'Alice' });

      expect(mockDb.where).toHaveBeenCalledWith(
        or(
          ilike(leads.fullName, '%Alice%'),
          ilike(leads.email, '%Alice%'),
          ilike(leads.phone, '%Alice%'),
          ilike(leads.notes, '%Alice%')
        )
      );
    });

    it('should filter leads by source in Kanban view', async () => {
      mockDbResult([mockLeads[0], mockLeads[3]]);

      await leadRepository.getLeadsByStage({ source: 'referral' });

      expect(mockDb.where).toHaveBeenCalledWith(eq(leads.source, 'referral'));
    });

    it('should filter leads by serviceType in Kanban view', async () => {
      mockDbResult([mockLeads[0], mockLeads[3]]);

      await leadRepository.getLeadsByStage({ serviceType: 'fencing' });

      expect(mockDb.where).toHaveBeenCalledWith(eq(leads.serviceType, 'fencing'));
    });

    it('should filter leads by assignedTo in Kanban view', async () => {
      mockDbResult([mockLeads[1]]);

      await leadRepository.getLeadsByStage({ assignedTo: 'user1' });

      expect(mockDb.where).toHaveBeenCalledWith(eq(leads.assignedTo, 'user1'));
    });
  });

  describe('getLeadEvents', () => {
    it('should return events for a lead', async () => {
      mockDbResult(mockLeadEvents);

      const result = await leadRepository.getLeadEvents('lead1');

      expect(mockDb.select).toHaveBeenCalledWith();
      expect(mockDb.from).toHaveBeenCalledWith(leadEvents);
      expect(mockDb.where).toHaveBeenCalledWith(eq(leadEvents.leadId, 'lead1'));
      expect(mockDb.orderBy).toHaveBeenCalledWith(desc(leadEvents.createdAt));
      expect(result).toEqual(mockLeadEvents);
    });
  });

  describe('createLeadEvent', () => {
    it('should create a new lead event', async () => {
      const eventData = {
        leadId: 'lead1',
        type: 'note',
        content: 'Test note',
        createdBy: 'user1',
        meta: { test: true },
      };
      const expectedEvent = { ...eventData, id: 'event3', createdAt: new Date() };

      mockDbResult([expectedEvent]);

      const result = await leadRepository.createLeadEvent(eventData);

      expect(mockDb.insert).toHaveBeenCalledWith(leadEvents);
      expect(mockDb.values).toHaveBeenCalledWith(eventData);
      expect(mockDb.returning).toHaveBeenCalled();
      expect(result).toEqual(expectedEvent);
    });
  });

  describe('logActivity', () => {
    it('should log an activity as a lead event', async () => {
      const leadId = 'lead1';
      const type = 'note';
      const content = 'Test note';
      const createdBy = 'user1';
      const meta = { test: true };
      const expectedEvent = {
        id: 'event3',
        leadId,
        type,
        content,
        createdBy,
        meta,
        createdAt: new Date(),
      };

      mockDbResult([expectedEvent]);

      const result = await leadRepository.logActivity(leadId, type, content, createdBy, meta);

      expect(mockDb.insert).toHaveBeenCalledWith(leadEvents);
      expect(mockDb.values).toHaveBeenCalledWith({
        leadId,
        type,
        content,
        createdBy,
        meta,
      });
      expect(mockDb.returning).toHaveBeenCalled();
      expect(result).toEqual(expectedEvent);
    });
  });

  describe('markLeadAsWon', () => {
    it('should mark a lead as won and link to job', async () => {
      const leadId = 'lead1';
      const jobId = 'job123';
      const updatedLead = { ...mockLeads[0], stage: 'won', jobId };

      mockDb.transaction.mockImplementationOnce((callback) => {
        // Mock the transaction behavior
        mockDbResult([updatedLead]); // For the update
        mockDbResult([{ id: 'event3' }]); // For the event insert
        return callback(mockDb);
      });

      const result = await leadRepository.markLeadAsWon(leadId, jobId);

      expect(mockDb.update).toHaveBeenCalledWith(leads);
      expect(mockDb.set).toHaveBeenCalledWith({
        stage: 'won',
        jobId,
        updatedAt: expect.any(Date),
      });
      expect(mockDb.where).toHaveBeenCalledWith(eq(leads.id, leadId));
      
      expect(mockDb.insert).toHaveBeenCalledWith(leadEvents);
      expect(mockDb.values).toHaveBeenCalledWith({
        leadId,
        type: 'status_change',
        content: 'Lead marked as won and converted to job',
        meta: { jobId },
      });
      
      expect(result).toEqual(updatedLead);
    });

    it('should mark a lead as won without job ID', async () => {
      const leadId = 'lead1';
      const updatedLead = { ...mockLeads[0], stage: 'won' };

      mockDb.transaction.mockImplementationOnce((callback) => {
        // Mock the transaction behavior
        mockDbResult([updatedLead]); // For the update
        mockDbResult([{ id: 'event3' }]); // For the event insert
        return callback(mockDb);
      });

      const result = await leadRepository.markLeadAsWon(leadId);

      expect(mockDb.update).toHaveBeenCalledWith(leads);
      expect(mockDb.set).toHaveBeenCalledWith({
        stage: 'won',
        updatedAt: expect.any(Date),
      });
      expect(mockDb.where).toHaveBeenCalledWith(eq(leads.id, leadId));
      
      expect(mockDb.insert).toHaveBeenCalledWith(leadEvents);
      expect(mockDb.values).toHaveBeenCalledWith({
        leadId,
        type: 'status_change',
        content: 'Lead marked as won',
        meta: {},
      });
      
      expect(result).toEqual(updatedLead);
    });

    it('should throw NotFoundError if lead not found', async () => {
      mockDb.transaction.mockImplementationOnce((callback) => {
        // Mock the transaction behavior
        mockDbResult([]); // Empty result for update means lead not found
        return callback(mockDb);
      });

      await expect(leadRepository.markLeadAsWon('nonexistent')).rejects.toThrow(
        new NotFoundError('Lead with ID nonexistent not found')
      );
    });
  });

  describe('markLeadAsLost', () => {
    it('should mark a lead as lost with reason', async () => {
      const leadId = 'lead1';
      const reason = 'Too expensive';
      const updatedLead = { ...mockLeads[0], stage: 'lost' };

      mockDb.transaction.mockImplementationOnce((callback) => {
        // Mock the transaction behavior
        mockDbResult([updatedLead]); // For the update
        mockDbResult([{ id: 'event3' }]); // For the event insert
        return callback(mockDb);
      });

      const result = await leadRepository.markLeadAsLost(leadId, reason);

      expect(mockDb.update).toHaveBeenCalledWith(leads);
      expect(mockDb.set).toHaveBeenCalledWith({
        stage: 'lost',
        updatedAt: expect.any(Date),
      });
      expect(mockDb.where).toHaveBeenCalledWith(eq(leads.id, leadId));
      
      expect(mockDb.insert).toHaveBeenCalledWith(leadEvents);
      expect(mockDb.values).toHaveBeenCalledWith({
        leadId,
        type: 'status_change',
        content: `Lead marked as lost: ${reason}`,
        meta: { reason },
      });
      
      expect(result).toEqual(updatedLead);
    });

    it('should mark a lead as lost without reason', async () => {
      const leadId = 'lead1';
      const updatedLead = { ...mockLeads[0], stage: 'lost' };

      mockDb.transaction.mockImplementationOnce((callback) => {
        // Mock the transaction behavior
        mockDbResult([updatedLead]); // For the update
        mockDbResult([{ id: 'event3' }]); // For the event insert
        return callback(mockDb);
      });

      const result = await leadRepository.markLeadAsLost(leadId);

      expect(mockDb.update).toHaveBeenCalledWith(leads);
      expect(mockDb.set).toHaveBeenCalledWith({
        stage: 'lost',
        updatedAt: expect.any(Date),
      });
      expect(mockDb.where).toHaveBeenCalledWith(eq(leads.id, leadId));
      
      expect(mockDb.insert).toHaveBeenCalledWith(leadEvents);
      expect(mockDb.values).toHaveBeenCalledWith({
        leadId,
        type: 'status_change',
        content: 'Lead marked as lost',
        meta: {},
      });
      
      expect(result).toEqual(updatedLead);
    });

    it('should throw NotFoundError if lead not found', async () => {
      mockDb.transaction.mockImplementationOnce((callback) => {
        // Mock the transaction behavior
        mockDbResult([]); // Empty result for update means lead not found
        return callback(mockDb);
      });

      await expect(leadRepository.markLeadAsLost('nonexistent')).rejects.toThrow(
        new NotFoundError('Lead with ID nonexistent not found')
      );
    });
  });

  describe('setFollowUp', () => {
    it('should set a follow-up date for a lead', async () => {
      const leadId = 'lead1';
      const followUpDate = new Date('2024-07-15T10:00:00Z');
      const updatedLead = { ...mockLeads[0], followUpDate };

      mockDb.transaction.mockImplementationOnce((callback) => {
        // Mock the transaction behavior
        mockDbResult([updatedLead]); // For the update
        mockDbResult([{ id: 'event3' }]); // For the event insert
        return callback(mockDb);
      });

      const result = await leadRepository.setFollowUp(leadId, followUpDate);

      expect(mockDb.update).toHaveBeenCalledWith(leads);
      expect(mockDb.set).toHaveBeenCalledWith({
        followUpDate,
        updatedAt: expect.any(Date),
      });
      expect(mockDb.where).toHaveBeenCalledWith(eq(leads.id, leadId));
      
      expect(mockDb.insert).toHaveBeenCalledWith(leadEvents);
      expect(mockDb.values).toHaveBeenCalledWith({
        leadId,
        type: 'follow_up_set',
        content: `Follow-up scheduled for ${followUpDate.toLocaleDateString()}`,
        meta: { followUpDate: followUpDate.toISOString() },
      });
      
      expect(result).toEqual(updatedLead);
    });

    it('should throw NotFoundError if lead not found', async () => {
      mockDb.transaction.mockImplementationOnce((callback) => {
        // Mock the transaction behavior
        mockDbResult([]); // Empty result for update means lead not found
        return callback(mockDb);
      });

      await expect(leadRepository.setFollowUp('nonexistent', new Date())).rejects.toThrow(
        new NotFoundError('Lead with ID nonexistent not found')
      );
    });
  });

  describe('clearFollowUp', () => {
    it('should clear the follow-up date for a lead', async () => {
      const leadId = 'lead1';
      const updatedLead = { ...mockLeads[0], followUpDate: null };

      mockDb.transaction.mockImplementationOnce((callback) => {
        // Mock the transaction behavior
        mockDbResult([updatedLead]); // For the update
        mockDbResult([{ id: 'event3' }]); // For the event insert
        return callback(mockDb);
      });

      const result = await leadRepository.clearFollowUp(leadId);

      expect(mockDb.update).toHaveBeenCalledWith(leads);
      expect(mockDb.set).toHaveBeenCalledWith({
        followUpDate: null,
        updatedAt: expect.any(Date),
      });
      expect(mockDb.where).toHaveBeenCalledWith(eq(leads.id, leadId));
      
      expect(mockDb.insert).toHaveBeenCalledWith(leadEvents);
      expect(mockDb.values).toHaveBeenCalledWith({
        leadId,
        type: 'follow_up_cleared',
        content: 'Follow-up cleared',
      });
      
      expect(result).toEqual(updatedLead);
    });

    it('should throw NotFoundError if lead not found', async () => {
      mockDb.transaction.mockImplementationOnce((callback) => {
        // Mock the transaction behavior
        mockDbResult([]); // Empty result for update means lead not found
        return callback(mockDb);
      });

      await expect(leadRepository.clearFollowUp('nonexistent')).rejects.toThrow(
        new NotFoundError('Lead with ID nonexistent not found')
      );
    });
  });

  describe('getUpcomingFollowUps', () => {
    it('should return leads with upcoming follow-ups within specified days', async () => {
      const today = new Date();
      const endDate = new Date();
      endDate.setDate(today.getDate() + 7); // 7 days from now
      
      mockDbResult([mockLeads[1]]); // Lead with future follow-up date

      const result = await leadRepository.getUpcomingFollowUps(7);

      expect(mockDb.select).toHaveBeenCalledWith();
      expect(mockDb.from).toHaveBeenCalledWith(leads);
      expect(mockDb.where).toHaveBeenCalled(); // Complex condition, hard to test exactly
      expect(mockDb.orderBy).toHaveBeenCalledWith(asc(leads.followUpDate));
      expect(result).toEqual([mockLeads[1]]);
    });
  });

  describe('getOverdueFollowUps', () => {
    it('should return leads with overdue follow-ups', async () => {
      const pastDate = new Date('2024-06-10T10:00:00Z'); // This is in the past
      mockDbResult([mockLeads[2]]); // Lead with past follow-up date

      const result = await leadRepository.getOverdueFollowUps();

      expect(mockDb.select).toHaveBeenCalledWith();
      expect(mockDb.from).toHaveBeenCalledWith(leads);
      expect(mockDb.where).toHaveBeenCalled(); // Complex condition, hard to test exactly
      expect(mockDb.orderBy).toHaveBeenCalledWith(asc(leads.followUpDate));
      expect(result).toEqual([mockLeads[2]]);
    });
  });

  describe('moveToStage', () => {
    it('should move a lead to a different stage with notes', async () => {
      const leadId = 'lead1';
      const stage = 'contacted';
      const notes = 'Called and discussed project';
      const updatedLead = { ...mockLeads[0], stage };

      mockDb.transaction.mockImplementationOnce((callback) => {
        // Mock the transaction behavior
        mockDbResult([updatedLead]); // For the update
        mockDbResult([{ id: 'event3' }]); // For the event insert
        return callback(mockDb);
      });

      const result = await leadRepository.moveToStage(leadId, stage, notes);

      expect(mockDb.update).toHaveBeenCalledWith(leads);
      expect(mockDb.set).toHaveBeenCalledWith({
        stage,
        updatedAt: expect.any(Date),
      });
      expect(mockDb.where).toHaveBeenCalledWith(eq(leads.id, leadId));
      
      expect(mockDb.insert).toHaveBeenCalledWith(leadEvents);
      expect(mockDb.values).toHaveBeenCalledWith({
        leadId,
        type: 'stage_change',
        content: `Lead moved to ${stage} stage: ${notes}`,
        meta: { stage, notes },
      });
      
      expect(result).toEqual(updatedLead);
    });

    it('should move a lead to a different stage without notes', async () => {
      const leadId = 'lead1';
      const stage = 'contacted';
      const updatedLead = { ...mockLeads[0], stage };

      mockDb.transaction.mockImplementationOnce((callback) => {
        // Mock the transaction behavior
        mockDbResult([updatedLead]); // For the update
        mockDbResult([{ id: 'event3' }]); // For the event insert
        return callback(mockDb);
      });

      const result = await leadRepository.moveToStage(leadId, stage);

      expect(mockDb.update).toHaveBeenCalledWith(leads);
      expect(mockDb.set).toHaveBeenCalledWith({
        stage,
        updatedAt: expect.any(Date),
      });
      expect(mockDb.where).toHaveBeenCalledWith(eq(leads.id, leadId));
      
      expect(mockDb.insert).toHaveBeenCalledWith(leadEvents);
      expect(mockDb.values).toHaveBeenCalledWith({
        leadId,
        type: 'stage_change',
        content: `Lead moved to ${stage} stage`,
        meta: { stage },
      });
      
      expect(result).toEqual(updatedLead);
    });

    it('should throw NotFoundError if lead not found', async () => {
      mockDb.transaction.mockImplementationOnce((callback) => {
        // Mock the transaction behavior
        mockDbResult([]); // Empty result for update means lead not found
        return callback(mockDb);
      });

      await expect(leadRepository.moveToStage('nonexistent', 'contacted')).rejects.toThrow(
        new NotFoundError('Lead with ID nonexistent not found')
      );
    });
  });
});
