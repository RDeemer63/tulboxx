import { BaseRepository, PaginationOptions, PaginatedResult } from "./BaseRepository";
import { invoices, contacts as customers, type Invoice, type Customer, type InsertInvoice } from "@shared/schema";
import { eq, desc, or, ilike, count, sum, inArray } from "drizzle-orm";

export type InvoiceWithCustomer = Invoice & { customer: Customer };

export class InvoiceRepository extends BaseRepository<InvoiceWithCustomer, InsertInvoice> {
  
  async findById(id: number): Promise<InvoiceWithCustomer | undefined> {
    const [result] = await this.db
      .select()
      .from(invoices)
      .leftJoin(customers, eq(invoices.customerId, customers.id))
      .where(eq(invoices.id, id))
      .limit(1);
    
    if (!result || !result.contacts) return undefined;
    
    return { ...result.invoices, customer: result.contacts };
  }

  async create(data: InsertInvoice): Promise<InvoiceWithCustomer> {
    const processedData: any = {
      ...data,
      totalAmount: typeof data.totalAmount === 'number' ? data.totalAmount.toString() : data.totalAmount
    };

    const [invoice] = await this.db
      .insert(invoices)
      .values(processedData)
      .returning();
    
    // Get the invoice with customer data
    const invoiceWithCustomer = await this.findById(invoice.id);
    if (!invoiceWithCustomer) {
      throw new Error('Failed to create invoice with customer data');
    }
    
    return invoiceWithCustomer;
  }

  async update(id: number, data: Partial<InsertInvoice>): Promise<InvoiceWithCustomer | undefined> {
    const processedData: any = {
      ...data,
      totalAmount: data.totalAmount && typeof data.totalAmount === 'number' ? data.totalAmount.toString() : data.totalAmount
    };

    const [invoice] = await this.db
      .update(invoices)
      .set(processedData)
      .where(eq(invoices.id, id))
      .returning();
    
    if (!invoice) return undefined;
    
    return await this.findById(invoice.id);
  }

  async delete(id: number): Promise<boolean> {
    const result = await this.db
      .delete(invoices)
      .where(eq(invoices.id, id));
    
    return (result.rowCount ?? 0) > 0;
  }

  async findPaginated(options: PaginationOptions): Promise<PaginatedResult<InvoiceWithCustomer>> {
    const { page, limit, search } = options;
    const offset = this.getOffset(page, limit);

    const baseQuery = this.db
      .select()
      .from(invoices)
      .leftJoin(customers, eq(invoices.customerId, customers.id));

    const baseCountQuery = this.db
      .select({ count: count() })
      .from(invoices);

    if (search) {
      const searchCondition = or(
        ilike(invoices.invoiceNumber, `%${search}%`),
        ilike(customers.firstName, `%${search}%`),
        ilike(customers.lastName, `%${search}%`)
      );
      
      const [rows, countResult] = await Promise.all([
        baseQuery.where(searchCondition).orderBy(desc(invoices.createdAt)).limit(limit).offset(offset),
        baseCountQuery.leftJoin(customers, eq(invoices.customerId, customers.id)).where(searchCondition)
      ]);

      const data = rows
        .filter(row => row.contacts !== null)
        .map(row => ({ ...row.invoices, customer: row.contacts! }));

      return this.createPaginationResult(data, countResult[0].count, page, limit);
    }

    const [rows, countResult] = await Promise.all([
      baseQuery.orderBy(desc(invoices.createdAt)).limit(limit).offset(offset),
      baseCountQuery
    ]);

    const data = rows
      .filter(row => row.contacts !== null)
      .map(row => ({ ...row.invoices, customer: row.contacts! }));

    return this.createPaginationResult(data, countResult[0].count, page, limit);
  }

  async findByCustomerId(customerId: number): Promise<InvoiceWithCustomer[]> {
    const rows = await this.db
      .select()
      .from(invoices)
      .leftJoin(customers, eq(invoices.customerId, customers.id))
      .where(eq(invoices.customerId, customerId))
      .orderBy(desc(invoices.createdAt));

    return rows
      .filter(row => row.contacts !== null)
      .map(row => ({ ...row.invoices, customer: row.contacts! }));
  }

  async findByStatus(status: string): Promise<InvoiceWithCustomer[]> {
    const rows = await this.db
      .select()
      .from(invoices)
      .leftJoin(customers, eq(invoices.customerId, customers.id))
      .where(eq(invoices.status, status))
      .orderBy(desc(invoices.createdAt));

    return rows
      .filter(row => row.contacts !== null)
      .map(row => ({ ...row.invoices, customer: row.contacts! }));
  }

  async getTotalRevenue(): Promise<number> {
    const [result] = await this.db
      .select({ total: sum(invoices.totalAmount) })
      .from(invoices)
      .where(eq(invoices.status, 'paid'));
    
    return parseFloat(result.total as string) || 0;
  }

  async getRecentInvoices(limit: number = 10): Promise<InvoiceWithCustomer[]> {
    const rows = await this.db
      .select()
      .from(invoices)
      .leftJoin(customers, eq(invoices.customerId, customers.id))
      .orderBy(desc(invoices.createdAt))
      .limit(limit);

    return rows
      .filter(row => row.contacts !== null)
      .map(row => ({ ...row.invoices, customer: row.contacts! }));
  }
}