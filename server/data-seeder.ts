import { db } from "./db";
import { 
  customers, 
  jobs, 
  estimates, 
  invoices, 
  businessProfiles, 
  employees, 
  timeEntries,
  payments,
  leadPipelineStages,
  leadPipelineEntries,
  leadNotes,
  leads,
  leadEvents,
  contacts
} from "@shared/schema";

interface SeedDataConfig {
  clearExisting?: boolean;
  createSampleData?: boolean;
  businessName?: string;
  ownerName?: string;
  ownerEmail?: string;
}

export class DataSeeder {
  async seedDatabase(config: SeedDataConfig = {}) {
    const {
      clearExisting = false,
      createSampleData = false,
      businessName = "Your Business",
      ownerName = "Business Owner",
      ownerEmail = "owner@yourbusiness.com"
    } = config;

    try {
      if (clearExisting) {
        await this.clearAllData();
      }

      if (createSampleData) {
        await this.createSampleData(businessName, ownerName, ownerEmail);
      }

      return { success: true, message: "Database seeded successfully" };
    } catch (error) {
      console.error("Error seeding database:", error);
      return { success: false, error: error.message };
    }
  }

  async clearAllData() {
    // Clear data in dependency order
    await db.delete(leadEvents);
    await db.delete(leadNotes);
    await db.delete(leadPipelineEntries);
    await db.delete(leadPipelineStages);
    await db.delete(leads);
    await db.delete(payments);
    await db.delete(timeEntries);
    await db.delete(documents); // Clear documents before jobs/invoices/estimates
    await db.delete(invoices);
    await db.delete(estimates);
    await db.delete(jobs);
    await db.delete(customers);
    await db.delete(employees);
    await db.delete(businessProfiles);
    
    console.log("All existing data cleared");
  }

  async createSampleData(businessName: string, ownerName: string, ownerEmail: string) {
    // Create business profile
    const [businessProfile] = await db.insert(businessProfiles).values({
      businessName,
      ownerFirstName: ownerName.split(' ')[0] || "Business",
      ownerLastName: ownerName.split(' ')[1] || "Owner",
      email: ownerEmail,
      phone: "(555) 123-4567",
      address: "123 Business Street",
      city: "Business City",
      state: "BC",
      zipCode: "12345",
      website: "www.yourbusiness.com",
      description: "Professional service business",
      logoUrl: null,
      primaryColor: "#3B82F6",
      secondaryColor: "#1E40AF"
    }).returning();

    // Create sample employee
    const [employee] = await db.insert(employees).values({
      firstName: ownerName.split(' ')[0] || "Business",
      lastName: ownerName.split(' ')[1] || "Owner",
      email: ownerEmail,
      phone: "(555) 123-4567",
      role: "owner",
      position: "Owner/Manager",
      hourlyRate: 75.00,
      isActive: true,
      businessProfileId: businessProfile.id
    }).returning();

    // Create sample customer
    const [customer] = await db.insert(customers).values({
      firstName: "Sample",
      lastName: "Customer",
      email: "customer@example.com",
      phone: "(555) 987-6543",
      address: "456 Customer Lane",
      city: "Customer City",
      state: "CC",
      zipCode: "54321",
      propertyType: "residential",
      preferredContactMethod: "phone",
      notes: "Initial sample customer for testing"
    }).returning();

    // Create sample job
    const [job] = await db.insert(jobs).values({
      customerId: customer.id,
      title: "Sample Project",
      description: "Initial sample project for demonstration",
      status: "completed",
      serviceType: "consultation",
      priority: "medium",
      estimatedValue: 1500.00,
      actualCost: 1400.00,
      scheduledDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      completedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      address: "456 Customer Lane, Customer City, CC 54321"
    }).returning();

    // Create sample estimate
    const [estimate] = await db.insert(estimates).values({
      customerId: customer.id,
      jobId: job.id,
      estimateNumber: "EST-001",
      title: "Sample Project Estimate",
      description: "Professional estimate for sample project",
      status: "accepted",
      subtotal: 1400.00,
      taxRate: 0.08,
      taxAmount: 112.00,
      totalAmount: 1512.00,
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      items: [
        {
          description: "Professional consultation and planning",
          quantity: 8,
          rate: 125.00,
          amount: 1000.00
        },
        {
          description: "Project materials and supplies",
          quantity: 1,
          rate: 400.00,
          amount: 400.00
        }
      ],
      terms: "Payment due within 30 days of acceptance"
    }).returning();

    // Create sample invoice
    const [invoice] = await db.insert(invoices).values({
      customerId: customer.id,
      jobId: job.id,
      estimateId: estimate.id,
      invoiceNumber: "INV-001",
      title: "Sample Project Invoice",
      description: "Invoice for completed sample project",
      status: "paid",
      subtotal: 1400.00,
      taxRate: 0.08,
      taxAmount: 112.00,
      totalAmount: 1512.00,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      paidAt: new Date(),
      items: [
        {
          description: "Professional consultation and planning",
          quantity: 8,
          rate: 125.00,
          amount: 1000.00
        },
        {
          description: "Project materials and supplies",
          quantity: 1,
          rate: 400.00,
          amount: 400.00
        }
      ],
      notes: "Thank you for your business!"
    }).returning();

    // Create sample payment
    await db.insert(payments).values({
      invoiceId: invoice.id,
      amount: 1512.00,
      method: "bank_transfer",
      status: "completed",
      transactionId: "TXN-001",
      paidAt: new Date(),
      notes: "Payment received via bank transfer"
    });

    // Create sample time entry
    await db.insert(timeEntries).values({
      employeeId: employee.id,
      jobId: job.id,
      startTime: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
      endTime: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      hoursWorked: 7.0,
      description: "Completed sample project work",
      hourlyRate: 75.00,
      totalAmount: 525.00,
      isBreakDeducted: true,
      breakDuration: 60 // 1 hour break
    });

    /* ------------------------------------------------------------------
     *  Leads & Lead Events (NEW)
     * ------------------------------------------------------------------ */
    const sampleLeads = await db
      .insert(leads)
      .values([
        {
          fullName: "Alice Prospect",
          phone: "(555) 000-1111",
          email: "alice@example.com",
          serviceType: "brush_cutting",
          source: "Facebook",
          notes: "Saw our Facebook ad.",
          stage: "new",
        },
        {
          fullName: "Bob Referral",
          phone: "(555) 222-3333",
          email: "bob@example.com",
          serviceType: "fencing",
          source: "Referral",
          notes: "Referred by previous client.",
          stage: "contacted",
          followUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        },
        {
          fullName: "Carla Contractor",
          phone: "(555) 444-5555",
          email: "carla@example.com",
          serviceType: "septic",
          source: "Google",
          notes: "Requested detailed quote.",
          stage: "estimate_sent",
        },
      ])
      .returning();

    // Lead events for timeline
    await db.insert(leadEvents).values([
      {
        leadId: sampleLeads[0].id,
        type: "created",
        content: "Lead created via sample data seeder",
      },
      {
        leadId: sampleLeads[1].id,
        type: "created",
        content: "Lead created via sample data seeder",
      },
      {
        leadId: sampleLeads[1].id,
        type: "call",
        content: "Left voicemail to introduce services",
        meta: { duration: 45 },
      },
      {
        leadId: sampleLeads[2].id,
        type: "created",
        content: "Lead created via sample data seeder",
      },
      {
        leadId: sampleLeads[2].id,
        type: "estimate_sent",
        content: "Sample estimate sent ($3,200)",
        meta: { amount: 3200 },
      },
    ]);

    console.log("Sample data created successfully");
  }

  async getDataStats() {
    const stats = {
      customers: await db.select().from(customers).then(rows => rows.length),
      jobs: await db.select().from(jobs).then(rows => rows.length),
      estimates: await db.select().from(estimates).then(rows => rows.length),
      invoices: await db.select().from(invoices).then(rows => rows.length),
      employees: await db.select().from(employees).then(rows => rows.length),
      timeEntries: await db.select().from(timeEntries).then(rows => rows.length),
      payments: await db.select().from(payments).then(rows => rows.length),
      leads: await db.select().from(leads).then(rows => rows.length)
    };

    return stats;
  }
}

export const dataSeeder = new DataSeeder();