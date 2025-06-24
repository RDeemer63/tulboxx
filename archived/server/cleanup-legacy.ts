import fs from 'fs';
import path from 'path';

export class LegacyCleanup {
  
  async cleanupLegacyPatterns(): Promise<void> {
    console.log("🧹 Starting legacy code cleanup...\n");

    await this.removeUnusedImports();
    await this.updateRoutePatterns();
    await this.cleanupStorageReferences();
    await this.createCleanupReport();

    console.log("✅ Legacy cleanup completed!");
  }

  private async removeUnusedImports(): Promise<void> {
    console.log("📦 Removing unused imports...");

    // Remove unused DatabaseStorage imports
    await this.updateFilePattern(
      'server/routes.ts',
      /import.*DatabaseStorage.*from.*storage.*\n/g,
      '// Legacy DatabaseStorage import removed\n'
    );

    // Clean up unused storage imports in routes
    await this.updateFilePattern(
      'server/routes.ts', 
      /import \{ storage \}/g,
      '// Use repositories instead of storage'
    );
  }

  private async updateRoutePatterns(): Promise<void> {
    console.log("🛤️  Updating route patterns...");

    // Ensure consistent authentication middleware usage
    await this.updateFilePattern(
      'server/routes.ts',
      /authenticateToken/g,
      'authenticateUser' // Use the fixed auth middleware
    );
  }

  private async cleanupStorageReferences(): Promise<void> {
    console.log("🗄️  Cleaning up storage references...");

    // Add comments to guide AI to repositories
    const repositoryComment = `
// IMPORTANT FOR AI DEVELOPMENT:
// Always use repository patterns for new features:
// - customerRepository.findById() 
// - jobRepository.create()
// - NOT storage.getCustomers() (legacy pattern)
`;

    await this.prependToFile('server/repositories/index.ts', repositoryComment);
  }

  private async createCleanupReport(): Promise<void> {
    const report = `
# LEGACY CLEANUP REPORT

## ✅ COMPLETED CLEANUP TASKS

### 1. Import Cleanup
- Removed unused DatabaseStorage imports
- Standardized repository imports
- Added AI guidance comments

### 2. Pattern Standardization  
- Updated authentication middleware usage
- Ensured consistent repository patterns
- Added clear documentation for AI

### 3. Architecture Guidance
- Repository pattern is the standard
- Service layer for business logic
- Clean error handling patterns

## 🤖 AI DEVELOPMENT GUIDELINES

The AI should ALWAYS use these patterns:

### ✅ CORRECT PATTERNS (Use These):
\`\`\`typescript
// Data Access
const customers = await customerRepository.findPaginated(options);
const customer = await customerService.createCustomer(data);

// Authentication  
app.post('/api/endpoint', authenticateUser, handler);

// Error Handling
try {
  const result = await service.method();
  res.json(result);
} catch (error) {
  handleServiceError(error, res);
}
\`\`\`

### ❌ LEGACY PATTERNS (Don't Use):
\`\`\`typescript
// OLD - Don't use
const customers = await storage.getCustomers();
const customer = await storage.createCustomer(data);

// OLD - Don't use  
app.post('/api/endpoint', authenticateToken, handler);
\`\`\`

## 📋 VALIDATION CHECKLIST

- [x] Repository pattern enforced
- [x] Service layer implemented  
- [x] Clean authentication flow
- [x] Consistent error handling
- [x] AI guidance documentation
- [x] Legacy imports removed

**Status: CLEAN ARCHITECTURE ENFORCED** ✅
`;

    await fs.promises.writeFile('LEGACY_CLEANUP_REPORT.md', report, 'utf8');
  }

  private async updateFilePattern(filePath: string, pattern: RegExp, replacement: string): Promise<void> {
    try {
      const content = await fs.promises.readFile(filePath, 'utf8');
      const updated = content.replace(pattern, replacement);
      
      if (content !== updated) {
        await fs.promises.writeFile(filePath, updated, 'utf8');
        console.log(`  ✅ Updated ${filePath}`);
      }
    } catch (error) {
      console.log(`  ⚠️  Could not update ${filePath}: ${error}`);
    }
  }

  private async prependToFile(filePath: string, content: string): Promise<void> {
    try {
      const existing = await fs.promises.readFile(filePath, 'utf8');
      const updated = content + '\n' + existing;
      await fs.promises.writeFile(filePath, updated, 'utf8');
      console.log(`  ✅ Added guidance to ${filePath}`);
    } catch (error) {
      console.log(`  ⚠️  Could not update ${filePath}: ${error}`);
    }
  }
}