import { db } from "../db";
import { eq, desc, and, gte, lte, count, sum, not, inArray, or, ilike } from "drizzle-orm";

export interface PaginationOptions {
  page: number;
  limit: number;
  search?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export abstract class BaseRepository<T, InsertT> {
  protected db = db;

  protected createPaginationResult<DataT>(
    data: DataT[], 
    total: number, 
    page: number, 
    limit: number
  ): PaginatedResult<DataT> {
    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    };
  }

  protected getOffset(page: number, limit: number): number {
    return (page - 1) * limit;
  }

  // Abstract methods that child repositories must implement
  abstract findById(id: number): Promise<T | undefined>;
  abstract create(data: InsertT): Promise<T>;
  abstract update(id: number, data: Partial<InsertT>): Promise<T | undefined>;
  abstract delete(id: number): Promise<boolean>;
  abstract findPaginated(options: PaginationOptions): Promise<PaginatedResult<T>>;
}