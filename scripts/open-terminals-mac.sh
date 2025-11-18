#!/bin/bash
# Opens macOS Terminal.app with two tabs and runs project dev servers

ROOT_DIR="/Users/bl10buer/Desktop/sp8004"
AGENT_DIR="$ROOT_DIR/agent-aura-sovereign"

osascript <<'APPLESCRIPT'
-- Open Terminal and start two tabs

tell application "Terminal"
  activate
  -- Tab 1: Root dev 8080
  do script "cd /Users/bl10buer/Desktop/sp8004 && npm run dev -- --port 8080"
  delay 0.5
  -- Tab 2: Agent dev 8081
  do script "cd /Users/bl10buer/Desktop/sp8004/agent-aura-sovereign && npm run dev"
end tell
APPLESCRIPT

exit 0
