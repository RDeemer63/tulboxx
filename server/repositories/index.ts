
// IMPORTANT FOR AI DEVELOPMENT:
// Always use repository patterns for new features:
// - customerRepository.findById() 
// - jobRepository.create()
// - NOT storage.getCustomers() (legacy pattern)

import { CustomerRepository } from "./CustomerRepository";
import { JobRepository } from "./JobRepository";
import { EstimateRepository } from "./EstimateRepository";
import { InvoiceRepository } from "./InvoiceRepository";
// NOTE: ProjectUpdateRepository has not been implemented yet.
// When the repository is created, uncomment the lines below.
// import { ProjectUpdateRepository } from "./ProjectUpdateRepository";

// Repository instances - singleton pattern
export const customerRepository = new CustomerRepository();
export const jobRepository = new JobRepository();
export const estimateRepository = new EstimateRepository();
export const invoiceRepository = new InvoiceRepository();
// export const projectUpdateRepository = new ProjectUpdateRepository();

// Export repository classes for dependency injection
export { CustomerRepository, JobRepository, EstimateRepository, InvoiceRepository /*, ProjectUpdateRepository */ };
export type { JobWithCustomer } from "./JobRepository";
export type { EstimateWithCustomer } from "./EstimateRepository";
export type { InvoiceWithCustomer } from "./InvoiceRepository";
// export type { ProjectUpdateWithEmployee } from "./ProjectUpdateRepository";