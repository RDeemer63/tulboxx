import { ModernEstimate, Job } from '../../shared/schema'; // Assuming Job type is in schema
import { v4 as uuidv4 } from 'uuid'; // For generating mock UUIDs if needed for other job fields

const logStubWarning = (functionName: string) => {
  if (process.env.MOCK_SERVICES === 'true' && process.env.NODE_ENV !== 'test') {
    console.warn(`⚠️ jobService.${functionName} is a STUB and using mock data. SET MOCK_SERVICES=false in .env to disable.`);
  }
};

// Define a simplified mock Job type for the stub
interface MockJob {
  id: number; // Matching serial primary key from jobs table
  title: string;
  status: string;
  customerId: number | null;
  estimateId?: string | null; // Link back to the modern estimate
  // Add other relevant job fields as needed for mock data
  createdAt: string;
  updatedAt: string;
}

const createMockJob = (estimateData: ModernEstimate, userId: string, customDetails?: Partial<MockJob>): MockJob => {
  return {
    id: Math.floor(Math.random() * 100000), // Mock serial ID
    title: customDetails?.title || `Job for Estimate ${estimateData.estimateNumber}`,
    status: 'pending_scheduling', // Default status for a new job
    customerId: estimateData.customerId,
    estimateId: estimateData.id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...customDetails,
  };
};

/**
 * @description Stub for Job Service.
 * TODO: Implement actual job creation and management logic.
 */
export const jobService = {
  /**
   * Creates a job from an estimate.
   * TODO: Implement this method to interact with the database via JobRepository.
   * This should create a new job record, link it to the estimate,
   * and potentially schedule it or set its initial status.
   * @param estimateData The estimate data to create a job from.
   * @param userId The ID of the user creating the job.
   * @param jobDetails Optional additional details for the job.
   * @returns A promise that resolves to the created job object.
   */
  async createJobFromEstimate(
    estimateData: ModernEstimate,
    userId: string,
    jobDetails?: Partial<Omit<Job, 'id' | 'createdAt' | 'updatedAt' | 'customerId' | 'estimateId' | 'modernEstimateId'>>
  ): Promise<MockJob> {
    logStubWarning('createJobFromEstimate');
    
    if (!estimateData || !estimateData.id) {
      throw new Error('Estimate data is required to create a job.');
    }

    console.log(`TODO: [jobService.createJobFromEstimate] Implement actual job creation for estimate ID: ${estimateData.id} by user ID: ${userId}`);
    console.log('Received job details:', jobDetails);

    // Return a mock job object
    const mockJob = createMockJob(estimateData, userId, {
      title: jobDetails?.title || `Job from Estimate ${estimateData.estimateNumber}`,
      // Map other jobDetails to the mockJob if necessary
    });
    
    console.log('Returning mock job:', mockJob);
    return mockJob;
  },

  /**
   * Retrieves a job by its ID.
   * TODO: Implement this method.
   * @param jobId The ID of the job to retrieve.
   * @returns A promise that resolves to the job object or null if not found.
   */
  async getJobById(jobId: number): Promise<MockJob | null> {
    logStubWarning('getJobById');
    console.log(`TODO: [jobService.getJobById] Implement actual job fetching for ID: ${jobId}`);
    if (jobId === 999999) return null; // Example for not found
    return {
      id: jobId,
      title: `Mock Job ${jobId}`,
      status: 'scheduled',
      customerId: 1,
      estimateId: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  // Add other stubbed job service methods as needed (e.g., updateJob, listJobs)
  // For example:
  // async listJobs(userId: string, params: any): Promise<PaginatedResponse<MockJob>> {
  //   logStubWarning('listJobs');
  //   console.log(`TODO: [jobService.listJobs] Implement actual job listing.`);
  //   const items = Array.from({ length: params.limit || 10 }).map((_, i) => this.getJobById(i + 1));
  //   return {
  //     items: await Promise.all(items.filter(j => j !== null) as Promise<MockJob[]>),
  //     totalItems: 50, // Mock total
  //     currentPage: params.page || 1,
  //     totalPages: Math.ceil(50 / (params.limit || 10)),
  //     limit: params.limit || 10,
  //   };
  // }
};

// Export type for a single job if not already defined elsewhere for services
export type JobServiceType = typeof jobService;
