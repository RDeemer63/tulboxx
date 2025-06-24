import { BaseService, ServiceError, ValidationError } from "./BaseService";
import { CustomerRepository } from "../repositories/CustomerRepository";
import { type Customer, type InsertCustomer } from "@shared/schema";
import { PaginationOptions, PaginatedResult } from "../repositories/BaseRepository";

export class CustomerService extends BaseService {
  constructor(private customerRepo: CustomerRepository) {
    super();
  }

  async createCustomer(data: InsertCustomer): Promise<Customer> {
    // Validate required fields
    const validationErrors = this.validateRequired(data, ['firstName', 'lastName']);
    
    // Validate email if provided
    if (data.email && !this.validateEmail(data.email)) {
      validationErrors.push({
        field: 'email',
        message: 'Invalid email format',
      });
    }

    // Validate phone if provided
    if (data.phone && !this.validatePhone(data.phone)) {
      validationErrors.push({
        field: 'phone',
        message: 'Invalid phone number format',
      });
    }

    if (validationErrors.length > 0) {
      throw new ServiceError('Validation failed', 400, validationErrors);
    }

    // Check for duplicate email
    if (data.email) {
      const existingCustomer = await this.customerRepo.findByEmail(data.email);
      if (existingCustomer) {
        throw new ServiceError('Customer with this email already exists', 409);
      }
    }

    // Create customer
    try {
      const customer = await this.customerRepo.create(data);
      return customer;
    } catch (error) {
      throw new ServiceError('Failed to create customer', 500);
    }
  }

  async updateCustomer(id: number, data: Partial<InsertCustomer>): Promise<Customer> {
    // Check if customer exists
    const existingCustomer = await this.customerRepo.findById(id);
    if (!existingCustomer) {
      throw new ServiceError('Customer not found', 404);
    }

    // Validate email if being updated
    if (data.email && !this.validateEmail(data.email)) {
      throw new ServiceError('Invalid email format', 400);
    }

    // Validate phone if being updated
    if (data.phone && !this.validatePhone(data.phone)) {
      throw new ServiceError('Invalid phone number format', 400);
    }

    // Check for duplicate email if email is being changed
    if (data.email && data.email !== existingCustomer.email) {
      const duplicateCustomer = await this.customerRepo.findByEmail(data.email);
      if (duplicateCustomer) {
        throw new ServiceError('Customer with this email already exists', 409);
      }
    }

    try {
      const updatedCustomer = await this.customerRepo.update(id, data);
      if (!updatedCustomer) {
        throw new ServiceError('Failed to update customer', 500);
      }
      return updatedCustomer;
    } catch (error) {
      throw new ServiceError('Failed to update customer', 500);
    }
  }

  async getCustomer(id: number): Promise<Customer> {
    const customer = await this.customerRepo.findById(id);
    if (!customer) {
      throw new ServiceError('Customer not found', 404);
    }
    return customer;
  }

  async getCustomers(options: PaginationOptions): Promise<PaginatedResult<Customer>> {
    try {
      return await this.customerRepo.findPaginated(options);
    } catch (error) {
      throw new ServiceError('Failed to fetch customers', 500);
    }
  }

  async deleteCustomer(id: number): Promise<void> {
    const customer = await this.customerRepo.findById(id);
    if (!customer) {
      throw new ServiceError('Customer not found', 404);
    }

    const success = await this.customerRepo.delete(id);
    if (!success) {
      throw new ServiceError('Failed to delete customer', 500);
    }
  }

  async getCustomersByStatus(status: string): Promise<Customer[]> {
    try {
      return await this.customerRepo.findByStatus(status);
    } catch (error) {
      throw new ServiceError('Failed to fetch customers by status', 500);
    }
  }
}