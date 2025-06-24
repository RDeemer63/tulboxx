import { LegacyCodeAuditor } from './legacy-audit';
import { LegacyCleanup } from './cleanup-legacy';

async function runLegacyAuditAndCleanup() {
  console.log("🔍 TULBOXX Legacy Code Audit & Cleanup\n");
  
  // First, audit the current state
  const auditor = new LegacyCodeAuditor();
  const issues = await auditor.auditCodebase();
  
  const highPriorityIssues = issues.filter(i => i.severity === 'HIGH').length;
  
  if (highPriorityIssues > 0) {
    console.log(`\n🚨 Found ${highPriorityIssues} high-priority issues!`);
    console.log("🧹 Running automatic cleanup...\n");
    
    const cleanup = new LegacyCleanup();
    await cleanup.cleanupLegacyPatterns();
    
    // Re-audit after cleanup
    console.log("\n🔍 Re-auditing after cleanup...\n");
    await auditor.auditCodebase();
  } else {
    console.log("\n✅ No critical legacy issues found!");
    console.log("🤖 AI will follow clean patterns in the codebase.");
  }
  
  console.log("\n🎯 Legacy audit and cleanup completed!");
}

// Run the audit if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runLegacyAuditAndCleanup()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Legacy audit failed:', error);
      process.exit(1);
    });
}

export { runLegacyAuditAndCleanup };