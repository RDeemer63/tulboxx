#!/bin/bash

# Color definitions for better output
C_RESET='\033[0m'
C_RED='\033[0;31m'
C_GREEN='\033[0;32m'
C_YELLOW='\033[0;33m'
C_CYAN='\033[0;36m'

# --- Script Header ---
echo -e "${C_CYAN}=======================================${C_RESET}"
echo -e "${C_CYAN}  TULBOXX Database Migration Runner    ${C_RESET}"
echo -e "${C_CYAN}=======================================${C_RESET}"

# 1. Check for exactly one argument
if [ "$#" -ne 1 ]; then
    echo -e "${C_RED}Error: Invalid number of arguments.${C_RESET}"
    echo "Usage: $0 <path_to_migration_file.ts>"
    echo "Example: $0 server/db/migrations/20250630_enhance_estimates.ts"
    exit 1
fi

MIGRATION_FILE=$1

# 2. Check if the migration file exists
if [ ! -f "$MIGRATION_FILE" ]; then
    echo -e "${C_RED}Error: Migration file not found at '${MIGRATION_FILE}'.${C_RESET}"
    exit 1
fi

# 3. Run the migration using tsx
echo -e "${C_YELLOW}🚀 Executing migration: ${MIGRATION_FILE}...${C_RESET}"
echo "----------------------------------------"

# Execute the TypeScript migration file using tsx
# npx ensures we use the project's local dependency
npx tsx "$MIGRATION_FILE"
EXIT_CODE=$? # Capture the exit code of the migration script

echo "----------------------------------------"

# 4. Handle errors and provide feedback
if [ $EXIT_CODE -eq 0 ]; then
    echo -e "${C_GREEN}✅ Migration script finished successfully.${C_RESET}"
else
    echo -e "${C_RED}🚨 Migration script failed with exit code ${EXIT_CODE}.${C_RESET}"
    echo -e "${C_RED}   Please review the logs above for details.${C_RESET}"
fi

# Exit with the same code as the migration script
exit $EXIT_CODE
