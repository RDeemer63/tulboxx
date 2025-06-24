#!/bin/bash

# ==============================================================================
# run-implementation.sh
#
# This script prepares the environment for testing the PDF generation
# feature of the Estimates Module. It performs the following steps:
#   1. Installs required PDF-related npm packages.
#   2. Starts the development server in the background.
#   3. Provides instructions and a URL for manual testing.
#
# Usage: ./run-implementation.sh
# ==============================================================================

# --- Color Definitions for Readable Output ---
C_RESET='\033[0m'
C_RED='\033[0;31m'
C_GREEN='\033[0;32m'
C_YELLOW='\033[0;33m'
C_BLUE='\033[0;34m'
C_CYAN='\033[0;36m'

# --- Helper Function to Open URL Cross-Platform ---
open_url() {
  local url=$1
  if command -v xdg-open &> /dev/null; then
    xdg-open "$url" # Linux
  elif command -v open &> /dev/null; then
    open "$url" # macOS
  elif command -v start &> /dev/null; then
    start "" "$url" # Windows
  else
    echo -e "${C_YELLOW}Could not detect a command to open the browser.${C_RESET}"
    echo -e "Please manually open your browser to: ${C_GREEN}${url}${C_RESET}"
  fi
}

# --- Script Header ---
echo -e "${C_BLUE}===================================================================${C_RESET}"
echo -e "${C_CYAN}  TULBOXX Estimates Module: PDF Implementation Setup               ${C_RESET}"
echo -e "${C_BLUE}===================================================================${C_RESET}"
echo "This script will install dependencies and start the server for testing."
echo ""

# --- 1. Install Dependencies ---
echo -e "${C_YELLOW}--- (1/3) Installing PDF dependencies... ---${C_RESET}"
npm install react-pdf pdfjs-dist
if [ $? -eq 0 ]; then
    echo -e "${C_GREEN}✅ PDF dependencies installed successfully.${C_RESET}"
else
    echo -e "${C_RED}🚨 Failed to install PDF dependencies. Please check npm logs.${C_RESET}"
    exit 1
fi
echo ""

# --- 2. Start Development Server ---
echo -e "${C_YELLOW}--- (2/3) Starting the development server... (This may take a moment) ---${C_RESET}"
# Run `npm run dev` in the background and capture its Process ID (PID)
npm run dev &
SERVER_PID=$!

# Function to clean up the server process on script exit
cleanup() {
    echo ""
    echo -e "${C_YELLOW}--- Shutting down development server (PID: $SERVER_PID) ---${C_RESET}"
    # Kill the process group to ensure all child processes are terminated
    kill -9 -$SERVER_PID 2>/dev/null || kill -9 $SERVER_PID 2>/dev/null
    echo "Server stopped."
}

# Register the cleanup function to run when the script exits
trap cleanup EXIT

echo "Waiting for the server to initialize..."
sleep 8 # Give the server time to start up

# --- 3. Display Instructions ---
DEV_URL="http://localhost:5173" # Standard Vite port
echo ""
echo -e "${C_GREEN}✅ Server should be running.${C_RESET}"
echo ""
echo -e "${C_BLUE}===================================================================${C_RESET}"
echo -e "${C_CYAN}  Ready for Testing: PDF Generation & Preview                    ${C_RESET}"
echo -e "${C_BLUE}===================================================================${C_RESET}"
echo "You can now test the PDF feature in your browser."
echo ""
echo -e "  1. Open the following URL: ${C_GREEN}${DEV_URL}/estimates${C_RESET}"
echo "  2. Log in with a test user account if prompted."
echo "  3. Create or edit an estimate to open the estimate form."
echo "  4. Navigate to the 'Terms & Delivery' tab."
echo "  5. Click the 'Preview What the Client Will See' button."
echo "  6. A PDF preview should appear within the form."
echo ""
echo -e "The development server is running in the background."
echo -e "You can stop it by pressing ${C_YELLOW}Ctrl+C${C_RESET} in this terminal window."
echo ""

# Keep the script alive to hold the background server process
wait $SERVER_PID
