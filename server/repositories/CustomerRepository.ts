import { BaseRepository, PaginationOptions, PaginatedResult } from "./BaseRepository";
import { contacts as customers, type Customer, type InsertCustomer } from "@shared/schema";
import { eq, desc, or, ilike, count } from "drizzle-orm";

export class CustomerRepository extends BaseRepository<Customer, InsertCustomer> {
  
  async findById(id: number): Promise<Customer | undefined> {
    const [customer] = await this.db
      .select()
      .from(customers)
      .where(eq(customers.id, id))
      .limit(1);
    
    return customer || undefined;
  }

  async findByEmail(email: string): Promise<Customer | undefined> {
    const [customer] = await this.db
      .select()
      .from(customers)
      .where(eq(customers.email, email))
      .limit(1);
    
    return customer || undefined;
  }

  async create(data: InsertCustomer): Promise<Customer> {
    const [customer] = await this.db
      .insert(customers)
      .values(data)
      .returning();
    
    return customer;
  }

  async update(id: number, data: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const [customer] = await this.db
      .update(customers)
      .set(data)
      .where(eq(customers.id, id))
      .returning();
    
    return customer || undefined;
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.db
      .delete(customers)
      .where(eq(customers.id, id));
    
    return (result.rowCount ?? 0) > 0;
  }

  async findPaginated(options: PaginationOptions): Promise<PaginatedResult<Customer>> {
    const { page, limit, search } = options;
    const offset = this.getOffset(page, limit);

    // Build base queries
    const baseQuery = this.db.select().from(customers);
    const baseCountQuery = this.db.select({ count: count() }).from(customers);

    if (search) {
      const searchCondition = or(
        ilike(customers.firstName, `%${search}%`),
        ilike(customers.lastName, `%${search}%`),
        ilike(customers.email, `%${search}%`),
        ilike(customers.phone, `%${search}%`)
      );
      
      // Execute filtered queries
      const [data, countResult] = await Promise.all([
        baseQuery.where(searchCondition).orderBy(desc(customers.createdAt)).limit(limit).offset(offset),
        baseCountQuery.where(searchCondition)
      ]);
      
      return this.createPaginationResult(data, countResult[0].count, page, limit);
    }

    // Execute unfiltered queries
    const [data, countResult] = await Promise.all([
      baseQuery.orderBy(desc(customers.createdAt)).limit(limit).offset(offset),
      baseCountQuery
    ]);

    return this.createPaginationResult(data, countResult[0].count, page, limit);
  }

  async findByStatus(status: string): Promise<Customer[]> {
    return await this.db
      .select()
      .from(customers)
      .where(eq(customers.status, status))
      .orderBy(desc(customers.createdAt));
  }

  async getTotalCount(): Promise<number> {
    const [{ count: total }] = await this.db
      .select({ count: count() })
      .from(customers);
    
    return total;
  }

  async getRecentCustomers(limit: number = 10): Promise<Customer[]> {
    return await this.db
      .select()
      .from(customers)
      .orderBy(desc(customers.createdAt))
      .limit(limit);
  }
}