import { SystemDiagnostics } from "./tests/test-diagnostics";

async function runSystemDiagnostics() {
  console.log("🔍 TULBOXX System Diagnostics\n");
  console.log("Checking system health before production deployment...\n");
  
  const diagnostics = new SystemDiagnostics();
  const results = await diagnostics.runDiagnostics();
  
  const failed = results.filter(r => r.status === 'FAIL').length;
  const warnings = results.filter(r => r.status === 'WARNING').length;
  
  console.log(`\n📋 FINAL ASSESSMENT:`);
  if (failed === 0 && warnings <= 2) {
    console.log("🟢 SYSTEM IS PRODUCTION READY!");
  } else if (failed <= 2) {
    console.log("🟡 SYSTEM NEEDS MINOR FIXES BEFORE PRODUCTION");
  } else {
    console.log("🔴 SYSTEM HAS CRITICAL ISSUES - NOT READY FOR PRODUCTION");
  }
  
  process.exit(failed > 2 ? 1 : 0);
}

runSystemDiagnostics().catch(console.error);