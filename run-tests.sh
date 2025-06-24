#!/bin/bash

# This script runs the backend test suite for the Tulboxx CRM.
# It ensures that both database integrity and API endpoints are functioning correctly.
#
# Requirements:
# - Node.js and npm/yarn installed.
# - Dependencies installed (`npm install`).
# - A `.env` file in the project root with `DATABASE_URL` and other required variables for the 'test' environment.

# Exit immediately if a command exits with a non-zero status.
set -e

# Function to clean up background processes on exit
cleanup() {
    echo ""
    echo "--- Cleaning up ---"
    if [ -n "$SERVER_PID" ] && ps -p $SERVER_PID > /dev/null; then
        echo "Stopping test server (PID: $SERVER_PID)..."
        # Use kill -9 for forceful shutdown in case of hanging processes
        kill -9 $SERVER_PID
    fi
    echo "Cleanup complete."
}

# Register the cleanup function to run on script exit, error, or interrupt
trap cleanup EXIT ERR INT

echo "======================================="
echo "🧪 Running Tulboxx Test Suite"
echo "======================================="

# 1. Set up environment
echo "Setting NODE_ENV=test"
export NODE_ENV=test

# 2. Run Database Tests
# These tests connect directly to the database to verify schema, relationships, and performance.
echo ""
echo "--- (1/2) Running Database Tests ---"
# We use ts-node with the -e flag to execute the test runner class from the specified file.
# The test file itself only exports the class, so we instantiate and run it here.
ts-node --files -e "import { DatabaseTester } from './server/tests/database-tests'; new DatabaseTester().runAllTests().then(() => console.log('Database test process finished.')).catch(err => { console.error('Database test runner failed:', err); process.exit(1); });"
echo "✅ Database tests completed successfully."

# 3. Run API Tests
# These tests require the server to be running to test the live endpoints.
echo ""
echo "--- (2/2) Running API Tests ---"

# Start the server in the background for API tests
echo "Starting test server in background..."
ts-node server/index.ts &
SERVER_PID=$!

# Wait for the server to start up.
# A more robust solution would be to poll the health-check endpoint.
echo "Waiting for server to initialize (PID: $SERVER_PID)..."
sleep 5

echo "Server is presumed to be running. Executing API tests..."
# Similar to DB tests, we execute the APITester class.
ts-node --files -e "import { APITester } from './server/tests/api-tests'; new APITester().runAllTests().then(() => console.log('API test process finished.')).catch(err => { console.error('API test runner failed:', err); process.exit(1); });"
echo "✅ API tests completed successfully."

# The 'trap' will execute the cleanup function automatically now.

# 4. Output final success message
echo ""
echo "======================================="
echo "🎉 All test suites passed successfully!"
echo "======================================="
