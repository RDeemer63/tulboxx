import { DatabaseTester } from "./tests/database-tests";
import { APITester, ServiceLayerTester } from "./tests/api-tests";

async function runComprehensiveTests() {
  console.log("🚀 TULBOXX Comprehensive System Testing Suite Starting...\n");
  
  let totalPassed = 0;
  let totalTests = 0;
  
  // Run database tests
  console.log("Phase 1: Database Testing");
  const dbTester = new DatabaseTester();
  const dbResults = await dbTester.runAllTests();
  totalPassed += dbResults.filter(r => r.passed).length;
  totalTests += dbResults.length;
  
  console.log("\n" + "=".repeat(60) + "\n");
  
  // Run service layer tests
  console.log("Phase 2: Service Layer Testing");
  const serviceTester = new ServiceLayerTester();
  const serviceResults = await serviceTester.runServiceTests();
  totalPassed += serviceResults.filter(r => r.passed).length;
  totalTests += serviceResults.length;
  
  console.log("\n" + "=".repeat(60) + "\n");
  
  // Run API endpoint tests
  console.log("Phase 3: API Endpoint Testing");
  const apiTester = new APITester();
  const apiResults = await apiTester.runAllTests();
  totalPassed += apiResults.filter(r => r.passed).length;
  totalTests += apiResults.length;
  
  // Final comprehensive summary
  console.log("\n" + "=".repeat(80));
  console.log("🏆 TULBOXX COMPREHENSIVE TEST RESULTS");
  console.log("=".repeat(80));
  console.log(`✅ Overall Score: ${totalPassed}/${totalTests} tests passed`);
  console.log(`📊 Success Rate: ${((totalPassed / totalTests) * 100).toFixed(1)}%`);
  
  // Performance analysis
  const allResults = [...dbResults, ...serviceResults, ...apiResults];
  const avgPerformance = allResults.reduce((sum, r) => sum + r.duration, 0) / allResults.length;
  const fastOperations = allResults.filter(r => r.duration <= 50).length;
  const slowOperations = allResults.filter(r => r.duration > 100).length;
  
  console.log(`⏱️  Average Operation Time: ${avgPerformance.toFixed(2)}ms`);
  console.log(`🚀 Fast Operations (≤50ms): ${fastOperations}`);
  console.log(`🐌 Slow Operations (>100ms): ${slowOperations}`);
  
  // System readiness assessment
  const criticalTests = dbResults.filter(r => 
    r.test.includes("Performance") || r.test.includes("Stats") || r.test.includes("Lookup")
  );
  const criticalPassed = criticalTests.filter(r => r.passed).length;
  
  console.log(`\n🎯 Critical Performance Tests: ${criticalPassed}/${criticalTests.length} passed`);
  
  if (totalPassed === totalTests) {
    console.log("🎉 ALL SYSTEMS OPERATIONAL - Ready for production deployment!");
    process.exit(0);
  } else if (criticalPassed === criticalTests.length) {
    console.log("⚠️  System functional with minor performance issues - Production ready with monitoring");
    process.exit(0);
  } else {
    console.log("❌ Critical systems need attention before production deployment");
    process.exit(1);
  }
}

runComprehensiveTests().catch((error) => {
  console.error("💥 Comprehensive test suite crashed:", error);
  process.exit(1);
});