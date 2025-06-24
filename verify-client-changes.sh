#!/bin/bash

# ==============================================================================
# verify-client-changes.sh
#
# This script starts the development server, opens the application in a browser,
# and provides a checklist for manually testing the newly implemented
# Estimate Capture Form components.
#
# It is designed to guide a user through a quality assurance (QA) pass
# on the latest UI/UX features for the Estimates Module.
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

# --- Script Header and Introduction ---
echo -e "${C_BLUE}===================================================================${C_RESET}"
echo -e "${C_CYAN}  TULBOXX Estimates Module: UI Verification Script                 ${C_RESET}"
echo -e "${C_BLUE}===================================================================${C_RESET}"
echo "This script will start the development server and provide a checklist"
echo "to test the new Estimate Capture Form."
echo ""

# --- Start Development Server ---
echo -e "${C_YELLOW}🚀 Starting the development server... (This may take a moment)${C_RESET}"
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

# --- Open Browser and Display Instructions ---
DEV_URL="http://localhost:5173" # Standard Vite port, adjust if your config is different
echo ""
echo -e "${C_GREEN}✅ Server should be running. Opening the application in your browser...${C_RESET}"
open_url "${DEV_URL}/estimates" # Navigate directly to the estimates page

echo ""
echo -e "${C_BLUE}===================================================================${C_RESET}"
echo -e "${C_CYAN}  📋 QA Checklist: Estimate Capture Form                            ${C_RESET}"
echo -e "${C_BLUE}===================================================================${C_RESET}"
echo "Please perform the following tests in the browser window that opened."
echo "Log in if necessary and navigate to create a new estimate."
echo ""
echo -e "${C_YELLOW}--- Tab 1: Client & Job Details ---${C_RESET}"
echo "  [ ] 1. **Default Title**: Confirm the estimate title auto-populates based on the service type and client name."
echo "  [ ] 2. **Timeline Field**: Test the free-text input for 'Expected Timeline' and click the AI assist button."
echo "  [ ] 3. **Estimate Format Toggle**: Verify that switching between 'Simple' and 'Detailed' works and changes the next tab."
echo "  [ ] 4. **Accordion Sections**: Check if the 'Client Information' and 'Job & Estimate Details' sections collapse and expand."
echo ""
echo -e "${C_YELLOW}--- Tab 2: Scope & Pricing (Simple Estimate) ---${C_RESET}"
echo "  [ ] 1. **AI Scope Buttons**: Test the 'Generate' and 'Improve' AI buttons. Confirm they log prompts to the console."
echo "  [ ] 2. **Pricing Inputs**: Add a base price and optional add-ons. Verify the total updates in real-time."
echo "  [ ] 3. **Totals Animation**: Check for the subtle green/red flash on the total when prices change."
echo "  [ ] 4. **Totals Tooltip**: Hover over the 'Total' value to see the calculation breakdown."
echo "  [ ] 5. **Convert to Detailed**: Click the 'Switch to Detailed' button and confirm the view changes and data is preserved."
echo ""
echo -e "${C_YELLOW}--- Tab 2: Scope & Pricing (Detailed Estimate) ---${C_RESET}"
echo "  [ ] 1. **Add Items**: Use '+ Add Line Item' and '+ Add Section Header' buttons."
echo "  [ ] 2. **Drag-and-Drop**: Reorder line items and sections. Confirm the UI updates smoothly."
echo "  [ ] 3. **Mobile View**: Resize the browser to a mobile width. Test the collapsible line item rows (tap to expand/collapse)."
echo "  [ ] 4. **Real-time Totals**: Change quantity and price on a line item and verify the main pricing summary updates."
echo "  [ ] 5. **Last Item Summary**: In collapsed mode on mobile, confirm only the description and total are visible."
echo ""
echo -e "${C_YELLOW}--- Tab 3: Terms & Delivery ---${C_RESET}"
echo "  [ ] 1. **Deposit Toggle**: Enable the 'Require Deposit' switch and test the percentage vs. fixed amount inputs."
echo "  [ ] 2. **Expiration Toggle**: Verify the expiration date is on by default and can be changed."
echo "  [ ] 3. **Terms Pre-fill**: Check that 'Terms & Conditions' are pre-filled (from business profile defaults)."
echo "  [ ] 4. **Delivery Buttons**: Test the 'Preview', 'Send', and 'Download' buttons. Confirm tooltips appear."
echo ""
echo -e "${C_YELLOW}--- Sticky Footer ---${C_RESET}"
echo "  [ ] 1. **Visibility**: Confirm the footer with 'Save Draft' and 'Send to Client' is always visible."
echo "  [ ] 2. **Scroll Behavior**: On a long form, scroll down and up. Check if the footer collapses or hides as expected."
echo ""
echo -e "${C_GREEN}===================================================================${C_RESET}"
echo "Testing complete. The development server is still running in the background."
echo -e "You can stop it by pressing ${C_YELLOW}Ctrl+C${C_RESET} in this terminal window."
echo ""

# Keep the script alive to hold the background server process
wait $SERVER_PID
