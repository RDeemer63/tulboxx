import { db } from "./db";

/**
 * Database Performance Optimizations
 * 
 * Creates essential indexes to improve query performance
 * Target: Bring all queries under 50ms for production readiness
 */

export async function createPerformanceIndexes() {
  console.log("🔧 Creating performance indexes...");

  try {
    // Customer table indexes
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_customers_id ON contacts(id);
    `);
    
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_customers_email ON contacts(email);
    `);

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_customers_created_at ON contacts(created_at);
    `);

    // Job table indexes
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_jobs_customer_id ON jobs(customer_id);
    `);

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
    `);

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at);
    `);

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_jobs_scheduled_date ON jobs(scheduled_date);
    `);

    // Estimate table indexes
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_estimates_job_id ON estimates(job_id);
    `);

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_estimates_customer_id ON estimates(customer_id);
    `);

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_estimates_status ON estimates(status);
    `);

    // Invoice table indexes
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);
    `);

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_invoices_estimate_id ON invoices(estimate_id);
    `);

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_invoices_job_id ON invoices(job_id);
    `);

    // Time entries table indexes
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_time_entries_employee_id ON time_entries(employee_id);
    `);

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_time_entries_work_order_id ON time_entries(work_order_id);
    `);

    // Composite indexes for common queries
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_jobs_customer_status ON jobs(customer_id, status);
    `);

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_estimates_customer_status ON estimates(customer_id, status);
    `);

    console.log("✅ Performance indexes created successfully");
    
    // Analyze tables to update statistics
    await db.execute(`ANALYZE contacts;`);
    await db.execute(`ANALYZE jobs;`);
    await db.execute(`ANALYZE estimates;`);
    await db.execute(`ANALYZE invoices;`);
    
    console.log("✅ Table statistics updated");

  } catch (error) {
    console.error("❌ Error creating indexes:", error);
    throw error;
  }
}

export async function optimizeQueries() {
  console.log("🚀 Running query optimization checks...");
  
  try {
    // Check current table statistics
    const customerCount = await db.execute(`SELECT COUNT(*) as count FROM contacts;`);
    const jobCount = await db.execute(`SELECT COUNT(*) as count FROM jobs;`);
    const estimateCount = await db.execute(`SELECT COUNT(*) as count FROM estimates;`);
    
    console.log(`📊 Table sizes: Customers: ${customerCount.rows[0].count}, Jobs: ${jobCount.rows[0].count}, Estimates: ${estimateCount.rows[0].count}`);
    
    // Test key query performance after optimization
    console.log("🔍 Testing optimized query performance...");
    
    const start = Date.now();
    await db.execute(`SELECT id, first_name, last_name FROM contacts WHERE id = 1 LIMIT 1;`);
    const customerLookup = Date.now() - start;
    
    const start2 = Date.now();
    await db.execute(`
      SELECT COUNT(*) as total_customers,
             (SELECT COUNT(*) FROM jobs WHERE status = 'scheduled') as active_jobs,
             (SELECT COUNT(*) FROM estimates WHERE status = 'pending') as pending_estimates;
    `);
    const dashboardStats = Date.now() - start2;
    
    console.log(`✅ Customer lookup: ${customerLookup}ms`);
    console.log(`✅ Dashboard stats: ${dashboardStats}ms`);
    
    if (customerLookup > 50 || dashboardStats > 60) {
      console.log("⚠️  Queries still slower than target - may need additional optimization");
    } else {
      console.log("🎉 Query performance targets achieved!");
    }
    
  } catch (error) {
    console.error("❌ Error during optimization:", error);
    throw error;
  }
}

export async function runDatabaseOptimization() {
  console.log("🏁 Starting database optimization process...\n");
  
  await createPerformanceIndexes();
  await optimizeQueries();
  
  console.log("\n✅ Database optimization complete!");
}