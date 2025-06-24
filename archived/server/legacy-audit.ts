import fs from 'fs';
import path from 'path';

interface LegacyIssue {
  file: string;
  line: number;
  issue: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  recommendation: string;
}

export class LegacyCodeAuditor {
  private issues: LegacyIssue[] = [];

  async auditCodebase(): Promise<LegacyIssue[]> {
    console.log("🔍 Auditing codebase for legacy patterns...\n");

    await this.auditServerCode();
    await this.auditClientCode();
    await this.auditDatabasePatterns();
    await this.auditImportPatterns();

    this.printAuditResults();
    return this.issues;
  }

  private async auditServerCode(): Promise<void> {
    console.log("🖥️  Auditing server-side code...");

    // Check for old storage class usage
    await this.checkFileForPatterns('server/routes.ts', [
      {
        pattern: /storage\.(get|create|update|delete)(?!Repository)/g,
        issue: 'Direct storage class usage instead of repository pattern',
        severity: 'HIGH' as const,
        recommendation: 'Replace with repository pattern: customerRepository.findById()'
      },
      {
        pattern: /DatabaseStorage/g,
        issue: 'Reference to old monolithic DatabaseStorage class',
        severity: 'HIGH' as const,
        recommendation: 'Use individual repositories instead'
      },
      {
        pattern: /storage\.db\./g,
        issue: 'Direct database access in routes',
        severity: 'HIGH' as const,
        recommendation: 'Use repository methods instead of direct DB access'
      }
    ]);

    // Check for old authentication patterns
    await this.checkFileForPatterns('server/routes.ts', [
      {
        pattern: /authenticateToken/g,
        issue: 'Old authentication middleware',
        severity: 'MEDIUM' as const,
        recommendation: 'Ensure using updated auth middleware'
      }
    ]);

    // Check storage.ts for cleanup opportunities
    await this.checkFileForPatterns('server/storage.ts', [
      {
        pattern: /async get\w+\(\)/g,
        issue: 'Legacy get* methods in storage class',
        severity: 'MEDIUM' as const,
        recommendation: 'Consider moving to repositories for consistency'
      }
    ]);
  }

  private async auditClientCode(): Promise<void> {
    console.log("💻 Auditing client-side code...");

    // Check for old API patterns
    await this.checkFileForPatterns('client/src/lib/api.ts', [
      {
        pattern: /fetch\([^)]*\)\.then\(res => res\.json\(\)\)/g,
        issue: 'Inconsistent API response handling',
        severity: 'MEDIUM' as const,
        recommendation: 'Standardize error handling in API calls'
      }
    ]);

    // Check React Query usage
    await this.checkFileForPatterns('client/src/lib/queryClient.ts', [
      {
        pattern: /staleTime:\s*Infinity/g,
        issue: 'Legacy infinite cache configuration',
        severity: 'HIGH' as const,
        recommendation: 'Should be fixed to reasonable staleTime'
      }
    ]);

    // Check for old dashboard patterns
    await this.checkFileForPatterns('client/src/pages/dashboard.tsx', [
      {
        pattern: /useQuery.*\/api\/\w+.*enabled: false/g,
        issue: 'Disabled queries that should use optimized endpoints',
        severity: 'MEDIUM' as const,
        recommendation: 'Use dashboard-optimized endpoints'
      }
    ]);
  }

  private async auditDatabasePatterns(): Promise<void> {
    console.log("💾 Auditing database patterns...");

    // Check for missing indexes
    const indexCheckScript = `
      SELECT schemaname, tablename, attname, n_distinct, correlation
      FROM pg_stats 
      WHERE schemaname = 'public' 
      AND n_distinct > 100
      AND correlation < 0.1;
    `;

    this.issues.push({
      file: 'database',
      line: 0,
      issue: 'Run index analysis to ensure all critical indexes exist',
      severity: 'MEDIUM',
      recommendation: 'Execute: npm run db:analyze-indexes'
    });

    // Check schema file for proper indexes
    await this.checkFileForPatterns('shared/schema.ts', [
      {
        pattern: /pgTable\([^)]+\)\s*;/g,
        issue: 'Table definition without indexes',
        severity: 'LOW' as const,
        recommendation: 'Ensure all foreign keys have indexes'
      }
    ]);
  }

  private async auditImportPatterns(): Promise<void> {
    console.log("📦 Auditing import patterns...");

    // Check for conflicting imports
    const serverFiles = [
      'server/routes.ts',
      'server/index.ts',
      'server/storage.ts'
    ];

    for (const file of serverFiles) {
      await this.checkFileForPatterns(file, [
        {
          pattern: /import.*storage.*from.*storage/g,
          issue: 'Mixed storage pattern imports',
          severity: 'MEDIUM' as const,
          recommendation: 'Standardize to repository imports'
        },
        {
          pattern: /import.*DatabaseStorage/g,
          issue: 'Import of legacy DatabaseStorage class',
          severity: 'HIGH' as const,
          recommendation: 'Replace with repository imports'
        }
      ]);
    }
  }

  private async checkFileForPatterns(filePath: string, patterns: Array<{
    pattern: RegExp;
    issue: string;
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
    recommendation: string;
  }>): Promise<void> {
    try {
      const content = await fs.promises.readFile(filePath, 'utf8');
      const lines = content.split('\n');

      patterns.forEach(({ pattern, issue, severity, recommendation }) => {
        lines.forEach((line, index) => {
          if (pattern.test(line)) {
            this.issues.push({
              file: filePath,
              line: index + 1,
              issue,
              severity,
              recommendation
            });
          }
        });
      });
    } catch (error) {
      // File doesn't exist or can't be read - that's okay
    }
  }

  private printAuditResults(): void {
    const high = this.issues.filter(i => i.severity === 'HIGH').length;
    const medium = this.issues.filter(i => i.severity === 'MEDIUM').length;
    const low = this.issues.filter(i => i.severity === 'LOW').length;

    console.log("\n" + "=".repeat(60));
    console.log("🔍 LEGACY CODE AUDIT RESULTS");
    console.log("=".repeat(60));
    console.log(`🔴 HIGH Priority Issues: ${high}`);
    console.log(`🟡 MEDIUM Priority Issues: ${medium}`);
    console.log(`⚪ LOW Priority Issues: ${low}`);
    console.log(`📊 Total Issues Found: ${this.issues.length}`);

    if (high > 0) {
      console.log("\n🚨 HIGH PRIORITY ISSUES (Fix Immediately):");
      this.issues.filter(i => i.severity === 'HIGH').forEach(issue => {
        console.log(`❌ ${issue.file}:${issue.line} - ${issue.issue}`);
        console.log(`   💡 ${issue.recommendation}\n`);
      });
    }

    if (medium > 0) {
      console.log("⚠️  MEDIUM PRIORITY ISSUES (Fix Soon):");
      this.issues.filter(i => i.severity === 'MEDIUM').forEach(issue => {
        console.log(`⚠️  ${issue.file}:${issue.line} - ${issue.issue}`);
        console.log(`   💡 ${issue.recommendation}\n`);
      });
    }

    console.log(`\n${high === 0 ? '✅ NO CRITICAL LEGACY ISSUES!' : '🔧 LEGACY CLEANUP NEEDED'}`);
    console.log("🤖 AI will use the cleanest patterns it finds in the codebase.");
  }
}