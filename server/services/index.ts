import { CustomerService } from "./CustomerService"; // Assuming this is a class
import { jobService as jobServiceStub } from "./jobService"; // Import the stub object
import { customerRepository, jobRepository } from "../repositories"; // Keep jobRepository for future use

// Instantiate CustomerService (assuming it's a class and takes customerRepository)
export const customerService = new CustomerService(customerRepository);

// Use the jobService stub directly.
// When JobService becomes a fully implemented class, this line might change to:
// export const jobService = new JobService(jobRepository, customerRepository);
export const jobService = jobServiceStub;

// Export instantiated services, service classes (for type usage or other instantiation patterns), and relevant types
export { CustomerService }; // Export the CustomerService class
export type { JobServiceType } from './jobService'; // Export the type of the jobService stub for consumers
export { ServiceError, type ValidationError } from "./BaseService"; // Assuming BaseService exists and exports these
