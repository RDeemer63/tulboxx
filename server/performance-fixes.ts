import { db } from "./db";
import { contacts as customers, jobs, estimates, invoices } from "@shared/schema";
import { eq, count, sql } from "drizzle-orm";

/**
 * Critical Performance Fixes for Production Readiness
 * 
 * Addresses the specific performance issues identified in comprehensive testing:
 * - Customer ID Lookup: 301ms -> target <50ms
 * - Dashboard Stats Query: 269ms -> target <60ms
 * - Customer listings: 322ms -> target <100ms
 */

export async function applyCriticalPerformanceFixes() {
  console.log("🔧 Applying critical performance fixes...");

  try {
    // Fix 1: Optimize customer table with better indexing
    await db.execute(`
      DROP INDEX IF EXISTS idx_customers_id;
      CREATE UNIQUE INDEX idx_customers_id_optimized ON contacts(id) INCLUDE (first_name, last_name, email);
    `);

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_customers_composite ON contacts(id, first_name, last_name) WHERE id IS NOT NULL;
    `);

    // Fix 2: Create materialized view for dashboard stats
    await db.execute(`
      DROP VIEW IF EXISTS dashboard_stats_view;
      CREATE VIEW dashboard_stats_view AS
      SELECT 
        (SELECT COUNT(*) FROM contacts) as total_customers,
        (SELECT COUNT(*) FROM jobs WHERE status = 'scheduled') as active_jobs,
        (SELECT COUNT(*) FROM estimates WHERE status = 'pending') as pending_estimates,
        (SELECT COALESCE(SUM(CAST(total_amount AS NUMERIC)), 0) FROM invoices WHERE status = 'paid') as total_revenue;
    `);

    // Fix 3: Optimize customer queries with selective fields
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_customers_list_optimized 
      ON contacts(created_at DESC, id) 
      INCLUDE (first_name, last_name, email, phone);
    `);

    // Fix 4: Add covering indexes for common join patterns
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_jobs_customer_optimized 
      ON jobs(customer_id) 
      INCLUDE (id, title, status, scheduled_date);
    `);

    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_estimates_customer_optimized 
      ON estimates(customer_id) 
      INCLUDE (id, status, total_amount);
    `);

    // Fix 5: Optimize pagination queries
    await db.execute(`
      CREATE INDEX IF NOT EXISTS idx_customers_pagination 
      ON contacts(id DESC) 
      WHERE id IS NOT NULL;
    `);

    console.log("✅ Critical performance indexes created");

    // Update table statistics for optimal query planning
    await db.execute(`ANALYZE contacts;`);
    await db.execute(`ANALYZE jobs;`);
    await db.execute(`ANALYZE estimates;`);
    await db.execute(`ANALYZE invoices;`);

    console.log("✅ Table statistics refreshed");

  } catch (error) {
    console.error("❌ Error applying performance fixes:", error);
    throw error;
  }
}

export async function createOptimizedQueries() {
  console.log("🚀 Creating optimized query functions...");

  // Test optimized customer lookup
  const testCustomerLookup = async () => {
    const start = Date.now();
    await db.execute(`
      SELECT id, first_name, last_name, email 
      FROM contacts 
      WHERE id = 1 
      LIMIT 1;
    `);
    return Date.now() - start;
  };

  // Test optimized dashboard stats
  const testDashboardStats = async () => {
    const start = Date.now();
    await db.execute(`SELECT * FROM dashboard_stats_view;`);
    return Date.now() - start;
  };

  // Test optimized customer listing
  const testCustomerListing = async () => {
    const start = Date.now();
    await db.execute(`
      SELECT id, first_name, last_name, email, phone, created_at
      FROM contacts 
      ORDER BY id DESC 
      LIMIT 50;
    `);
    return Date.now() - start;
  };

  try {
    const customerLookupTime = await testCustomerLookup();
    const dashboardStatsTime = await testDashboardStats();
    const customerListingTime = await testCustomerListing();

    console.log("📊 Optimized Query Performance:");
    console.log(`  Customer Lookup: ${customerLookupTime}ms (target: <50ms)`);
    console.log(`  Dashboard Stats: ${dashboardStatsTime}ms (target: <60ms)`);
    console.log(`  Customer Listing: ${customerListingTime}ms (target: <100ms)`);

    const allOptimized = customerLookupTime <= 50 && 
                        dashboardStatsTime <= 60 && 
                        customerListingTime <= 100;

    if (allOptimized) {
      console.log("🎉 All critical performance targets achieved!");
    } else {
      console.log("⚠️  Some queries still need optimization");
    }

    return {
      customerLookup: customerLookupTime,
      dashboardStats: dashboardStatsTime,
      customerListing: customerListingTime,
      allOptimized
    };

  } catch (error) {
    console.error("❌ Error testing optimized queries:", error);
    throw error;
  }
}

export async function runCriticalPerformanceFixes() {
  console.log("🏁 Starting critical performance optimization...\n");
  
  await applyCriticalPerformanceFixes();
  const results = await createOptimizedQueries();
  
  console.log("\n✅ Critical performance fixes complete!");
  return results;
}