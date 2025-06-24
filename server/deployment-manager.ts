import { dataSeeder } from "./data-seeder";

/**
 * Deployment Manager for Tulboxx
 * 
 * Handles production deployment data management:
 * - Remove demo data before launch
 * - Seed fresh data for beta testing
 * - Manage environment transitions
 */

export class DeploymentManager {
  
  /**
   * Prepare for production deployment
   * Removes all demo data and prepares clean database
   */
  async prepareForProduction() {
    try {
      console.log("Starting production deployment preparation...");
      
      // Clear all demo data
      await dataSeeder.clearAllData();
      
      console.log("Demo data cleared successfully");
      console.log("Database is now clean and ready for production deployment");
      
      return {
        success: true,
        message: "Production deployment ready - all demo data removed",
        nextSteps: [
          "Deploy application to production",
          "Use data seeder to create initial business data",
          "Set up beta testing accounts"
        ]
      };
      
    } catch (error) {
      console.error("Error preparing for production:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to prepare for production deployment"
      };
    }
  }

  /**
   * Set up beta testing environment
   * Creates sample data for beta testers
   */
  async setupBetaTesting(businesses: Array<{
    businessName: string;
    ownerName: string;
    ownerEmail: string;
  }>) {
    try {
      console.log("Setting up beta testing environment...");
      
      const results = [];
      
      for (const business of businesses) {
        const result = await dataSeeder.seedDatabase({
          createSampleData: true,
          businessName: business.businessName,
          ownerName: business.ownerName,
          ownerEmail: business.ownerEmail
        });
        
        results.push({
          business: business.businessName,
          result
        });
      }
      
      console.log(`Beta testing setup complete for ${businesses.length} businesses`);
      
      return {
        success: true,
        message: "Beta testing environment ready",
        businesses: results
      };
      
    } catch (error) {
      console.error("Error setting up beta testing:", error);
      return {
        success: false,
        error: error.message,
        message: "Failed to setup beta testing environment"
      };
    }
  }

  /**
   * Get deployment status and data statistics
   */
  async getDeploymentStatus() {
    try {
      const stats = await dataSeeder.getDataStats();
      const hasData = Object.values(stats).some(count => count > 0);
      
      return {
        hasData,
        dataStats: stats,
        deploymentReady: !hasData,
        recommendation: hasData 
          ? "Clear demo data before production deployment" 
          : "Ready for production deployment"
      };
      
    } catch (error) {
      console.error("Error getting deployment status:", error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export const deploymentManager = new DeploymentManager();