import { FeatureTester } from "./tests/feature-tests";

async function runFeatureTests() {
  console.log("🎯 TULBOXX Frontend Feature Testing Suite\n");
  
  const tester = new FeatureTester();
  const results = await tester.runAllTests();
  
  const allPassed = results.every(r => r.passed);
  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;
  
  console.log("\n" + "=".repeat(80));
  console.log("🏆 FRONTEND TESTING COMPLETE");
  console.log("=".repeat(80));
  console.log(`Final Score: ${passedCount}/${totalCount} workflows passed`);
  console.log(`Success Rate: ${((passedCount / totalCount) * 100).toFixed(1)}%`);
  
  if (allPassed) {
    console.log("🎉 ALL FRONTEND WORKFLOWS OPERATIONAL!");
    console.log("✅ User workflows validated");
    console.log("✅ API integration confirmed");
    console.log("✅ Data flow verified");
    process.exit(0);
  } else {
    console.log("⚠️  Some workflows need attention");
    console.log("🔧 Review failed tests above for specific issues");
    process.exit(1);
  }
}

runFeatureTests().catch((error) => {
  console.error("💥 Frontend testing suite crashed:", error);
  process.exit(1);
});