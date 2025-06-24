import { storage } from "../storage";

interface APITestResult {
  endpoint: string;
  method: string;
  passed: boolean;
  duration: number;
  statusCode?: number;
  error?: string;
  details?: string;
}

export class APITester {
  private results: APITestResult[] = [];
  private baseUrl = "http://localhost:5000";

  async runAllTests(): Promise<APITestResult[]> {
    console.log("🌐 Starting API Endpoint Testing Suite...\n");

    await this.testCustomerEndpoints();
    await this.testJobEndpoints();
    await this.testEstimateEndpoints();
    await this.testDashboardEndpoints();
    await this.testServiceLayerEndpoints();

    this.printResults();
    return this.results;
  }

  private async testCustomerEndpoints(): Promise<void> {
    console.log("👥 Testing Customer Endpoints...");

    // Test GET customers
    await this.testEndpoint("GET", "/api/customers", {
      expectedStatus: 200,
      maxDuration: 100,
      description: "Fetch all customers"
    });

    // Test customer pagination
    await this.testEndpoint("GET", "/api/customers?page=1&limit=10", {
      expectedStatus: 200,
      maxDuration: 150,
      description: "Customer pagination"
    });

    // Test customer search
    await this.testEndpoint("GET", "/api/customers?search=test", {
      expectedStatus: 200,
      maxDuration: 150,
      description: "Customer search functionality"
    });

    // Test individual customer fetch
    await this.testEndpoint("GET", "/api/customers/1", {
      expectedStatus: 200,
      maxDuration: 75,
      description: "Fetch single customer"
    });
  }

  private async testJobEndpoints(): Promise<void> {
    console.log("🔨 Testing Job Endpoints...");

    // Test GET jobs
    await this.testEndpoint("GET", "/api/jobs", {
      expectedStatus: 200,
      maxDuration: 100,
      description: "Fetch all jobs"
    });

    // Test job pagination
    await this.testEndpoint("GET", "/api/jobs?page=1&limit=10", {
      expectedStatus: 200,
      maxDuration: 150,
      description: "Job pagination"
    });

    // Test individual job fetch
    await this.testEndpoint("GET", "/api/jobs/1", {
      expectedStatus: 200,
      maxDuration: 75,
      description: "Fetch single job"
    });
  }

  private async testEstimateEndpoints(): Promise<void> {
    console.log("📋 Testing Modern Estimate Endpoints...");

    // Test GET estimates
    await this.testEndpoint("GET", "/api/estimates", {
      expectedStatus: 200,
      maxDuration: 100,
      description: "Fetch all estimates"
    });

    // Test individual estimate fetch
    await this.testEndpoint(
      "GET",
      // Use a placeholder UUID to reflect modern estimate IDs
      "/api/estimates/00000000-0000-0000-0000-000000000001",
      {
      expectedStatus: 200,
      maxDuration: 75,
      description: "Fetch single estimate"
      }
    );
  }

  private async testDashboardEndpoints(): Promise<void> {
    console.log("📊 Testing Dashboard Endpoints...");

    // Test optimized dashboard stats
    await this.testEndpoint("GET", "/api/dashboard/stats-optimized", {
      expectedStatus: 200,
      maxDuration: 60,
      description: "Dashboard statistics (optimized)"
    });

    // Test today's schedule
    await this.testEndpoint("GET", "/api/dashboard/today-schedule", {
      expectedStatus: 200,
      maxDuration: 100,
      description: "Today's job schedule"
    });

    // Test recent jobs
    await this.testEndpoint("GET", "/api/dashboard/recent-jobs", {
      expectedStatus: 200,
      maxDuration: 100,
      description: "Recent jobs listing"
    });
  }

  private async testServiceLayerEndpoints(): Promise<void> {
    console.log("🔧 Testing Service Layer Integration...");

    // Test business profile
    await this.testEndpoint("GET", "/api/business-profile", {
      expectedStatus: 200,
      maxDuration: 75,
      description: "Business profile data"
    });

    // Test employees
    await this.testEndpoint("GET", "/api/employees", {
      expectedStatus: 200,
      maxDuration: 75,
      description: "Employee listings"
    });

    // Test time entries
    await this.testEndpoint("GET", "/api/time-entries", {
      expectedStatus: 200,
      maxDuration: 100,
      description: "Time tracking entries"
    });

    // Test invoices
    await this.testEndpoint("GET", "/api/invoices", {
      expectedStatus: 200,
      maxDuration: 100,
      description: "Invoice listings"
    });
  }

  private async testEndpoint(
    method: string,
    endpoint: string,
    options: {
      expectedStatus: number;
      maxDuration: number;
      description: string;
      body?: any;
    }
  ): Promise<void> {
    const start = Date.now();
    const fullUrl = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(fullUrl, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
      });

      const duration = Date.now() - start;
      const passed = response.status === options.expectedStatus && duration <= options.maxDuration;

      this.results.push({
        endpoint,
        method,
        passed,
        duration,
        statusCode: response.status,
        details: passed 
          ? `✅ ${duration}ms (target: <${options.maxDuration}ms)` 
          : `❌ ${duration}ms (target: <${options.maxDuration}ms) Status: ${response.status}`
      });

      console.log(`  ${passed ? '✅' : '❌'} ${method} ${endpoint}: ${duration}ms (${response.status})`);

    } catch (error) {
      const duration = Date.now() - start;
      this.results.push({
        endpoint,
        method,
        passed: false,
        duration,
        error: error instanceof Error ? error.message : String(error)
      });

      console.log(`  ❌ ${method} ${endpoint}: ERROR - ${error}`);
    }
  }

  private printResults(): void {
    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;
    const avgDuration = this.results.reduce((sum, r) => sum + r.duration, 0) / total;

    console.log("\n" + "=".repeat(60));
    console.log("🌐 TULBOXX API ENDPOINT TEST RESULTS");
    console.log("=".repeat(60));
    console.log(`✅ Passed: ${passed}/${total} endpoints`);
    console.log(`⏱️  Average Response Time: ${avgDuration.toFixed(2)}ms`);
    console.log(`${passed === total ? '🎉 ALL API TESTS PASSED!' : '⚠️  Some endpoints failed'}`);

    // Response time analysis
    const fastEndpoints = this.results.filter(r => r.passed && r.duration <= 50);
    const slowEndpoints = this.results.filter(r => r.duration > 100);

    console.log(`\n📊 Performance Analysis:`);
    console.log(`   Fast responses (≤50ms): ${fastEndpoints.length}`);
    console.log(`   Slow responses (>100ms): ${slowEndpoints.length}`);

    const failed = this.results.filter(r => !r.passed);
    if (failed.length > 0) {
      console.log("\n❌ FAILED ENDPOINTS:");
      failed.forEach(test => {
        console.log(`  • ${test.method} ${test.endpoint}: ${test.error || test.details}`);
      });
    }

    const warnings = this.results.filter(r => r.passed && r.duration > 100);
    if (warnings.length > 0) {
      console.log("\n⚠️  PERFORMANCE WARNINGS:");
      warnings.forEach(test => {
        console.log(`  • ${test.method} ${test.endpoint}: ${test.duration}ms (slower than expected)`);
      });
    }

    console.log("\n" + "=".repeat(60));
  }
}

// Direct storage testing for service layer validation
export class ServiceLayerTester {
  private results: APITestResult[] = [];

  async runServiceTests(): Promise<APITestResult[]> {
    console.log("⚙️  Testing Service Layer Directly...\n");

    await this.testStoragePerformance();
    await this.testDataConsistency();

    this.printServiceResults();
    return this.results;
  }

  private async testStoragePerformance(): Promise<void> {
    console.log("🗄️  Testing Storage Performance...");

    await this.testStorageMethod("getCustomers", async () => {
      await storage.getCustomers();
    }, 50);

    await this.testStorageMethod("getJobs", async () => {
      await storage.getJobs();
    }, 75);

    await this.testStorageMethod("getDashboardStats", async () => {
      await storage.getDashboardStats();
    }, 60);

    await this.testStorageMethod("getEstimates", async () => {
      await storage.getEstimates();
    }, 75);
  }

  private async testDataConsistency(): Promise<void> {
    console.log("🔍 Testing Data Consistency...");

    await this.testStorageMethod("customerJobRelation", async () => {
      const customers = await storage.getCustomers();
      const jobs = await storage.getJobs();
      
      // Verify all jobs have valid customer references
      const customerIds = new Set(customers.map(c => c.id));
      const validRelations = jobs.every(job => customerIds.has(job.customerId));
      
      if (!validRelations) throw new Error("Invalid customer-job relationships found");
    }, 100);

    await this.testStorageMethod("estimateJobRelation", async () => {
      const estimates = await storage.getEstimates();
      const jobs = await storage.getJobs();
      
      // Verify estimates with job references are valid
      const jobIds = new Set(jobs.map(j => j.id));
      const validEstimates = estimates
        .filter(e => e.jobId !== null)
        .every(estimate => jobIds.has(estimate.jobId!));
      
      if (!validEstimates) throw new Error("Invalid estimate-job relationships found");
    }, 100);
  }

  private async testStorageMethod(
    name: string,
    test: () => Promise<void>,
    maxDuration: number
  ): Promise<void> {
    const start = Date.now();
    try {
      await test();
      const duration = Date.now() - start;
      const passed = duration <= maxDuration;

      this.results.push({
        endpoint: name,
        method: "STORAGE",
        passed,
        duration,
        details: passed 
          ? `✅ ${duration}ms (target: <${maxDuration}ms)` 
          : `❌ ${duration}ms (target: <${maxDuration}ms)`
      });

      console.log(`  ${passed ? '✅' : '❌'} ${name}: ${duration}ms`);
    } catch (error) {
      const duration = Date.now() - start;
      this.results.push({
        endpoint: name,
        method: "STORAGE",
        passed: false,
        duration,
        error: error instanceof Error ? error.message : String(error)
      });

      console.log(`  ❌ ${name}: ERROR - ${error}`);
    }
  }

  private printServiceResults(): void {
    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;
    const avgDuration = this.results.reduce((sum, r) => sum + r.duration, 0) / total;

    console.log("\n" + "=".repeat(50));
    console.log("⚙️  SERVICE LAYER TEST RESULTS");
    console.log("=".repeat(50));
    console.log(`✅ Passed: ${passed}/${total} service tests`);
    console.log(`⏱️  Average Duration: ${avgDuration.toFixed(2)}ms`);
    console.log(`${passed === total ? '🎉 ALL SERVICE TESTS PASSED!' : '⚠️  Some services failed'}`);

    const failed = this.results.filter(r => !r.passed);
    if (failed.length > 0) {
      console.log("\n❌ FAILED SERVICES:");
      failed.forEach(test => {
        console.log(`  • ${test.endpoint}: ${test.error || test.details}`);
      });
    }

    console.log("\n" + "=".repeat(50));
  }
}