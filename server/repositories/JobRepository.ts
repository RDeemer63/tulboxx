import { BaseRepository, PaginationOptions, PaginatedResult } from "./BaseRepository";
import { jobs, contacts as customers, type Job, type Customer, type InsertJob } from "@shared/schema";
import { eq, desc, or, ilike, count, and, gte, lte, inArray } from "drizzle-orm";

export type JobWithCustomer = Job & { customer: Customer };

export class JobRepository extends BaseRepository<JobWithCustomer, InsertJob> {
  
  async findById(id: number): Promise<JobWithCustomer | undefined> {
    const [result] = await this.db
      .select()
      .from(jobs)
      .leftJoin(customers, eq(jobs.customerId, customers.id))
      .where(eq(jobs.id, id))
      .limit(1);
    
    if (!result || !result.contacts) return undefined;
    
    return { ...result.jobs, customer: result.contacts };
  }

  async create(data: InsertJob): Promise<JobWithCustomer> {
    // Process scheduled date if it's a string
    const processedData: any = {
      ...data,
      scheduledDate: data.scheduledDate && typeof data.scheduledDate === 'string' 
        ? new Date(data.scheduledDate) 
        : data.scheduledDate
    };

    const [job] = await this.db
      .insert(jobs)
      .values(processedData)
      .returning();
    
    // Get the job with customer data
    const jobWithCustomer = await this.findById(job.id);
    if (!jobWithCustomer) {
      throw new Error('Failed to create job with customer data');
    }
    
    return jobWithCustomer;
  }

  async update(id: number, data: Partial<InsertJob>): Promise<JobWithCustomer | undefined> {
    const processedData: any = {
      ...data,
      scheduledDate: data.scheduledDate && typeof data.scheduledDate === 'string' 
        ? new Date(data.scheduledDate) 
        : data.scheduledDate
    };

    const [job] = await this.db
      .update(jobs)
      .set(processedData)
      .where(eq(jobs.id, id))
      .returning();
    
    if (!job) return undefined;
    
    return await this.findById(job.id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.db
      .delete(jobs)
      .where(eq(jobs.id, id));
    
    return (result.rowCount ?? 0) > 0;
  }

  async findPaginated(options: PaginationOptions): Promise<PaginatedResult<JobWithCustomer>> {
    const { page, limit, search } = options;
    const offset = this.getOffset(page, limit);

    const baseQuery = this.db
      .select()
      .from(jobs)
      .leftJoin(customers, eq(jobs.customerId, customers.id));

    const baseCountQuery = this.db
      .select({ count: count() })
      .from(jobs);

    if (search) {
      const searchCondition = or(
        ilike(jobs.title, `%${search}%`),
        ilike(jobs.description, `%${search}%`),
        ilike(customers.firstName, `%${search}%`),
        ilike(customers.lastName, `%${search}%`)
      );
      
      const [rows, countResult] = await Promise.all([
        baseQuery.where(searchCondition).orderBy(desc(jobs.createdAt)).limit(limit).offset(offset),
        baseCountQuery.leftJoin(customers, eq(jobs.customerId, customers.id)).where(searchCondition)
      ]);

      const data = rows
        .filter(row => row.contacts !== null)
        .map(row => ({ ...row.jobs, customer: row.contacts! }));

      return this.createPaginationResult(data, countResult[0].count, page, limit);
    }

    const [rows, countResult] = await Promise.all([
      baseQuery.orderBy(desc(jobs.createdAt)).limit(limit).offset(offset),
      baseCountQuery
    ]);

    const data = rows
      .filter(row => row.contacts !== null)
      .map(row => ({ ...row.jobs, customer: row.contacts! }));

    return this.createPaginationResult(data, countResult[0].count, page, limit);
  }

  async findByCustomerId(customerId: number): Promise<JobWithCustomer[]> {
    const rows = await this.db
      .select()
      .from(jobs)
      .leftJoin(customers, eq(jobs.customerId, customers.id))
      .where(eq(jobs.customerId, customerId))
      .orderBy(desc(jobs.createdAt));

    return rows
      .filter(row => row.contacts !== null)
      .map(row => ({ ...row.jobs, customer: row.contacts! }));
  }

  async findByStatus(status: string): Promise<JobWithCustomer[]> {
    const rows = await this.db
      .select()
      .from(jobs)
      .leftJoin(customers, eq(jobs.customerId, customers.id))
      .where(eq(jobs.status, status))
      .orderBy(desc(jobs.createdAt));

    return rows
      .filter(row => row.contacts !== null)
      .map(row => ({ ...row.jobs, customer: row.contacts! }));
  }

  async getTodaySchedule(): Promise<JobWithCustomer[]> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    const rows = await this.db
      .select()
      .from(jobs)
      .leftJoin(customers, eq(jobs.customerId, customers.id))
      .where(and(
        gte(jobs.scheduledDate, startOfDay),
        lte(jobs.scheduledDate, endOfDay)
      ))
      .orderBy(jobs.scheduledDate);

    return rows
      .filter(row => row.contacts !== null)
      .map(row => ({ ...row.jobs, customer: row.contacts! }));
  }

  async getActiveJobsCount(): Promise<number> {
    const [{ count: total }] = await this.db
      .select({ count: count() })
      .from(jobs)
      .where(inArray(jobs.status, ['scheduled', 'in_progress']));
    
    return total;
  }

  async getRecentJobs(limit: number = 10): Promise<JobWithCustomer[]> {
    const rows = await this.db
      .select()
      .from(jobs)
      .leftJoin(customers, eq(jobs.customerId, customers.id))
      .orderBy(desc(jobs.createdAt))
      .limit(limit);

    return rows
      .filter(row => row.contacts !== null)
      .map(row => ({ ...row.jobs, customer: row.contacts! }));
  }
}