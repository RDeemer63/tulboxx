import { db } from './db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  try {
    console.log('Running critical database indexes migration...');
    
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'migrations', '001-add-critical-indexes.sql'),
      'utf8'
    );
    
    // Execute the migration
    await db.execute(migrationSQL);
    
    console.log('✅ Critical indexes added successfully!');
    console.log('Database performance should be significantly improved.');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();