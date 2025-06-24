import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import postgres from 'postgres';
import readline from 'readline';
import { fileURLToPath } from 'url';
import crypto from 'crypto'; // For generating UUIDs
import { db as drizzleDb, pool as drizzlePool } from '../db'; // Drizzle ORM instance and pool
import *s from '../../shared/schema'; // All schema objects

// --- Configuration ---
const __filename = fileURLToPath(import.meta.url);
const projectRoot = path.resolve(path.dirname(__filename), '..', '..');

dotenv.config({ path: path.join(projectRoot, '.env') });

interface SeedConfig {
  clearExisting: boolean;
  createSampleData: boolean;
  // These specific config options might not be used if we hardcode sample data names
  businessName?: string;
  ownerName?: string;
  ownerEmail?: string;
}

function parseArguments(): SeedConfig {
  const args = process.argv.slice(2);

  const config: SeedConfig = {
    clearExisting:
      args.includes('--clear') ||
      args.includes('--clear-existing') ||
      process.env.SEED_CLEAR_EXISTING === 'true',
    createSampleData:
      args.includes('--sample') ||
      args.includes('--create-sample-data') ||
      process.env.SEED_CREATE_SAMPLE_DATA === 'true',
    businessName: process.env.SEED_BUSINESS_NAME,
    ownerName: process.env.SEED_OWNER_NAME,
    ownerEmail: process.env.SEED_OWNER_EMAIL,
  };
  
  if (!config.clearExisting && !config.createSampleData && !args.includes('--no-sample')) {
    config.createSampleData = true;
  }

  return config;
}

function askForConfirmation(query: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase() === 'yes');
    });
  });
}

async function clearAllData(db: typeof drizzleDb) {
  console.log('\n🗑️  Clearing all existing data (respecting foreign key order)...');
  try {
    // Delete from tables with most dependencies first (children)
    await db.delete(s.estimateLineItems); console.log('- estimateLineItems cleared');
    await db.delete(s.leadEvents); console.log('- leadEvents cleared');
    await db.delete(s.payments); console.log('- payments cleared');
    await db.delete(s.timeEntries); console.log('- timeEntries cleared');
    await db.delete(s.documents); console.log('- documents cleared');
    await db.delete(s.changeOrders); console.log('- changeOrders cleared (references legacy estimates)');
    await db.delete(s.invoices); console.log('- invoices cleared');
    await db.delete(s.modernEstimates); console.log('- modernEstimates cleared');
    await db.delete(s.estimates); console.log('- estimates (legacy) cleared'); // Legacy estimates
    await db.delete(s.workOrderMaterials); console.log('- workOrderMaterials cleared');
    await db.delete(s.workOrderTasks); console.log('- workOrderTasks cleared');
    await db.delete(s.workOrders); console.log('- workOrders cleared');
    await db.delete(s.jobs); console.log('- jobs cleared');
    await db.delete(s.leadNotes); console.log('- leadNotes cleared');
    await db.delete(s.leadPipelineEntries); console.log('- leadPipelineEntries cleared');
    await db.delete(s.leads); console.log('- leads cleared');
    await db.delete(s.contacts); console.log('- contacts (customers) cleared'); // Also aliased as customers
    await db.delete(s.inventoryItems); console.log('- inventoryItems cleared');
    await db.delete(s.suppliers); console.log('- suppliers cleared');
    await db.delete(s.equipmentMaintenance); console.log('- equipmentMaintenance cleared');
    await db.delete(s.assignedRoutes); console.log('- assignedRoutes cleared');
    await db.delete(s.equipment); console.log('- equipment cleared');
    await db.delete(s.employeeAvailability); console.log('- employeeAvailability cleared');
    await db.delete(s.employeePermissions); console.log('- employeePermissions cleared');
    await db.delete(s.permissions); console.log('- permissions (legacy) cleared');
    await db.delete(s.notifications); console.log('- notifications cleared');
    await db.delete(s.leadPipelineStages); console.log('- leadPipelineStages cleared');
    await db.delete(s.employees); console.log('- employees cleared');
    await db.delete(s.users); console.log('- users cleared'); // Replit Auth users
    await db.delete(s.sessions); console.log('- sessions cleared'); // Replit Auth sessions
    await db.delete(s.businessProfiles); console.log('- businessProfiles cleared');
    await db.delete(s.recurringBilling); console.log('- recurringBilling cleared');
    await db.delete(s.communications); console.log('- communications cleared');
    await db.delete(s.contactActivities); console.log('- contactActivities cleared');
    await db.delete(s.projectUpdates); console.log('- projectUpdates cleared');
    await db.delete(s.estimateTemplates); console.log('- estimateTemplates cleared');


    console.log('✅ All data cleared successfully.');
  } catch (error) {
    console.error('❌ Error clearing data:', error);
    throw error;
  }
}

async function createSampleData(
  db: typeof drizzleDb,
  config: {
    businessName?: string;
    ownerName?: string;
    ownerEmail?: string;
  }
) {
  console.log('\n🌱 Creating sample data...');

  const businessName = config.businessName || 'Precision Services Co.';
  const ownerFullName = config.ownerName || 'Ryan Deemer';
  const ownerEmail = config.ownerEmail || 'ryan.deemer@example.com';
  const ownerFirstName = ownerFullName.split(' ')[0];
  const ownerLastName = ownerFullName.split(' ').slice(1).join(' ') || 'Owner';

  // 1. Business Profile
  const [businessProfile] = await db.insert(s.businessProfiles).values({
    businessName: businessName,
    ownerName: ownerFullName, // Using combined name for this field
    email: ownerEmail,
    phone: '(555) 100-2000',
    address: '123 Main St',
    city: 'Service City',
    state: 'SC',
    zipCode: '12345',
    website: 'www.precisionservices.co',
    businessType: 'General Contracting', // From schema
    defaultTaxRate: "0.07", // 7%
    // Add other required fields from businessProfiles schema if any
  }).returning();
  console.log(`+ Business Profile: ${businessProfile.businessName}`);

  // 2. Users (for Replit Auth, and createdBy fields)
  // For `createdBy` fields that are UUID and reference users.id (varchar), this is problematic.
  // Seeding user with varchar ID as per schema.
  const [adminUser] = await db.insert(s.users).values({
    id: 'user_admin_owner_01', // Varchar ID
    email: ownerEmail,
    passwordHash: '$2b$10$abcdefghijklmnopqrstuv', // Placeholder hash
    firstName: ownerFirstName,
    lastName: ownerLastName,
    businessProfileId: businessProfile.id,
    role: 'owner',
    isActive: true,
  }).returning();
  console.log(`+ User (Admin/Owner): ${adminUser.email}`);

  const [sampleEmployeeUser] = await db.insert(s.users).values({
    id: 'user_employee_jane_01', // Varchar ID
    email: 'jane.doe@example.com',
    passwordHash: '$2b$10$abcdefghijklmnopqrstuv',
    firstName: 'Jane',
    lastName: 'Doe',
    businessProfileId: businessProfile.id,
    role: 'employee',
    isActive: true,
  }).returning();
  console.log(`+ User (Employee): ${sampleEmployeeUser.email}`);


  // 3. Employees
  const [ownerEmployee] = await db.insert(s.employees).values({
    firstName: ownerFirstName,
    lastName: ownerLastName,
    email: ownerEmail,
    phone: '(555) 100-2001',
    role: 'owner',
    hourlyRate: "75.00",
    isActive: true,
    // businessProfileId: businessProfile.id, // Schema for employees doesn't have businessProfileId
  }).returning();
  console.log(`+ Employee (Owner): ${ownerEmployee.firstName} ${ownerEmployee.lastName}`);

  const [janeEmployee] = await db.insert(s.employees).values({
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane.doe@example.com',
    phone: '(555) 100-2002',
    role: 'technician',
    hourlyRate: "45.00",
    isActive: true,
  }).returning();
  console.log(`+ Employee (Technician): ${janeEmployee.firstName} ${janeEmployee.lastName}`);

  // 4. Contacts (Customers)
  const [customer1] = await db.insert(s.contacts).values({
    firstName: 'Alice', lastName: 'Wonderland', email: 'alice.w@example.com', phone: '(555) 300-4001', status: 'customer',
  }).returning();
  const [customer2] = await db.insert(s.contacts).values({
    firstName: 'Bob', lastName: 'The Builder', email: 'bob.b@example.com', phone: '(555) 300-4002', status: 'customer',
  }).returning();
  console.log(`+ Contacts (Customers): ${customer1.firstName}, ${customer2.firstName}`);

  // 5. Leads
  const sampleLeadsData = [
    { fullName: 'Charlie Prospect', phone: '(555) 500-6001', email: 'charlie.p@example.net', serviceType: 'fencing', source: 'Website', stage: 'new', notes: 'Interested in a new fence for backyard.', assignedTo: crypto.randomUUID() },
    { fullName: 'Diana Inquiry', phone: '(555) 500-6002', email: 'diana.i@example.net', serviceType: 'landscaping', source: 'Referral', stage: 'contacted', notes: 'Called, discussed basic needs. Follow up next week.', followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), assignedTo: crypto.randomUUID() },
    { fullName: 'Edward Quotee', phone: '(555) 500-6003', email: 'edward.q@example.net', serviceType: 'brush_cutting', source: 'Google Ads', stage: 'estimate_sent', notes: 'Estimate #E1001 sent for $1200.', assignedTo: janeEmployee.id ? crypto.randomUUID() : null }, // assignedTo is UUID
    { fullName: 'Fiona Client', phone: '(555) 500-6004', email: 'fiona.c@example.net', serviceType: 'septic', source: 'Facebook', stage: 'won', notes: 'Approved estimate #E1002. Job #J2001 created.', jobId: crypto.randomUUID() },
    { fullName: 'George Pass', phone: '(555) 500-6005', email: 'george.p@example.net', serviceType: 'fencing', source: 'Truck Sign', stage: 'lost', notes: 'Chose a different contractor. Reason: Price.', assignedTo: crypto.randomUUID() },
  ];
  const createdLeads = await db.insert(s.leads).values(sampleLeadsData).returning();
  console.log(`+ Leads: ${createdLeads.length} created`);

  // 6. Lead Events
  const leadEventsData = [];
  if (createdLeads[0]) leadEventsData.push({ leadId: createdLeads[0].id, type: 'created', content: 'Lead created from website form.', createdBy: crypto.randomUUID() });
  if (createdLeads[1]) {
    leadEventsData.push({ leadId: createdLeads[1].id, type: 'created', content: 'Lead referred by an existing customer.', createdBy: crypto.randomUUID() });
    leadEventsData.push({ leadId: createdLeads[1].id, type: 'call', content: 'Initial call made, discussed project.', createdBy: crypto.randomUUID(), meta: { duration_seconds: 300 } });
  }
  if (createdLeads[2]) {
    leadEventsData.push({ leadId: createdLeads[2].id, type: 'created', content: 'Lead from Google Ads campaign.', createdBy: crypto.randomUUID() });
    leadEventsData.push({ leadId: createdLeads[2].id, type: 'estimate_sent', content: 'Estimate E1001 sent for $1200.', createdBy: crypto.randomUUID(), meta: { estimate_id: 'E1001', amount: 1200 } });
  }
  if (leadEventsData.length > 0) {
    await db.insert(s.leadEvents).values(leadEventsData);
    console.log(`+ Lead Events: ${leadEventsData.length} created`);
  }

  // 7. Modern Estimates & Line Items
  const estimatesToCreate = [];
  const lineItemsToCreate = [];

  // Estimate for Edward Quotee (estimate_sent stage)
  if (createdLeads[2]) {
    const estimate1Id = crypto.randomUUID();
    const estimate1Subtotal = 1100.00;
    const estimate1Tax = estimate1Subtotal * 0.07; // 7% tax
    const estimate1Total = estimate1Subtotal + estimate1Tax;
    estimatesToCreate.push({
      id: estimate1Id,
      leadId: createdLeads[2].id,
      status: 'sent',
      subtotal: String(estimate1Subtotal),
      tax: String(estimate1Tax),
      total: String(estimate1Total),
      notes: 'Estimate for brush cutting services.',
      createdBy: crypto.randomUUID(), // UUID, references users.id (varchar) - schema issue
    });
    lineItemsToCreate.push(
      { estimateId: estimate1Id, title: 'Brush Clearing - Area 1', description: 'Clear dense brush from section A.', quantity: 5, unitPrice: "100.00", total: "500.00" },
      { estimateId: estimate1Id, title: 'Haul Away Debris', description: 'Remove and dispose of all cleared vegetation.', quantity: 1, unitPrice: "600.00", total: "600.00" }
    );
  }
  // Estimate for Fiona Client (won stage)
  if (createdLeads[3]) {
    const estimate2Id = crypto.randomUUID();
    const estimate2Subtotal = 2800.00;
    const estimate2Tax = estimate2Subtotal * 0.07;
    const estimate2Total = estimate2Subtotal + estimate2Tax;
    estimatesToCreate.push({
      id: estimate2Id,
      leadId: createdLeads[3].id,
      status: 'approved',
      subtotal: String(estimate2Subtotal),
      tax: String(estimate2Tax),
      total: String(estimate2Total),
      notes: 'Estimate for septic system installation.',
      createdBy: crypto.randomUUID(),
    });
    lineItemsToCreate.push(
      { estimateId: estimate2Id, title: 'Septic Tank (1000 Gallon)', quantity: 1, unitPrice: "1500.00", total: "1500.00" },
      { estimateId: estimate2Id, title: 'Drain Field Installation', quantity: 1, unitPrice: "1000.00", total: "1000.00" },
      { estimateId: estimate2Id, title: 'Permits and Inspection', quantity: 1, unitPrice: "300.00", total: "300.00" }
    );
  }

  if (estimatesToCreate.length > 0) {
    await db.insert(s.modernEstimates).values(estimatesToCreate);
    console.log(`+ Modern Estimates: ${estimatesToCreate.length} created`);
    if (lineItemsToCreate.length > 0) {
      await db.insert(s.estimateLineItems).values(lineItemsToCreate);
      console.log(`+ Estimate Line Items: ${lineItemsToCreate.length} created`);
    }
  }

  // ... (seeding for legacy estimates, jobs, invoices, etc. can be retained from previous data-seeder.ts if needed)
  // For brevity, focusing on new tables here. The previous `data-seeder.ts` had more.

  console.log('✅ Sample data creation complete.');
}

async function getDataStats(db: typeof drizzleDb) {
  console.log('\n📊 Database Statistics:');
  const stats = {
    businessProfiles: await db.select().from(s.businessProfiles).then(r => r.length),
    users: await db.select().from(s.users).then(r => r.length),
    employees: await db.select().from(s.employees).then(r => r.length),
    contacts: await db.select().from(s.contacts).then(r => r.length),
    leads: await db.select().from(s.leads).then(r => r.length),
    leadEvents: await db.select().from(s.leadEvents).then(r => r.length),
    modernEstimates: await db.select().from(s.modernEstimates).then(r => r.length),
    estimateLineItems: await db.select().from(s.estimateLineItems).then(r => r.length),
    // Add other relevant tables
  };
  for (const [key, value] of Object.entries(stats)) {
    console.log(`   - ${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`);
  }
  return stats;
}


async function main() {
  console.log('🚀 Starting Database Seeding Script...');
  const config = parseArguments();

  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set.');
    process.exit(1);
  }

  if (config.clearExisting) {
    printWarning(config);
    const proceed = await askForConfirmation(
      `This will clear existing data. Are you sure you want to proceed? (yes/no): `
    );
    if (!proceed) {
      console.log('🚫 Operation cancelled by user.');
      process.exit(0);
    }
  }
  
  console.log('ℹ️  Configuration:');
  console.log(`   Clear existing data: ${config.clearExisting}`);
  console.log(`   Create sample data:  ${config.createSampleData}`);


  // Using the Drizzle ORM instance for seeding operations
  const db = drizzleDb; 

  try {
    console.log('\n🔗 Connected to the database (using Drizzle pool).');

    if (config.clearExisting) {
      await clearAllData(db);
    }

    if (config.createSampleData) {
      await createSampleData(db, {
        businessName: config.businessName,
        ownerName: config.ownerName,
        ownerEmail: config.ownerEmail,
      });
    }
    
    await getDataStats(db);

    console.log('\n🎉 Database seeding process completed successfully!');
    process.exitCode = 0;
  } catch (error) {
    console.error('\n🚨 An error occurred during the seeding process:');
    console.error(error);
    process.exitCode = 1;
  } finally {
    // Drizzle ORM typically manages its own pool, but if using a direct client:
    // await drizzlePool.end(); // Or specific client.end() if not using global pool
    console.log('\n🚪 Database connections managed by Drizzle pool. Script finished.');
    console.log('🏁 Seeding script finished.');
  }
}

function printWarning(config: SeedConfig) {
  console.warn('\n⚠️  WARNING: DESTRUCTIVE OPERATION! ⚠️');
  console.warn('---------------------------------------------------------------------');
  console.warn(`This script is configured to CLEAR ALL EXISTING DATA if the --clear flag is used.`);
  console.warn('This should ONLY be used in local development environments.');
  console.warn('Ensure you have a database backup if you have important data.');
  console.warn('---------------------------------------------------------------------\n');
}

main().catch(err => {
  console.error("Unhandled error in main execution:", err);
  process.exit(1);
});
