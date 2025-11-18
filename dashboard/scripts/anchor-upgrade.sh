#!/usr/bin/env bash
set -euo pipefail
PROGRAM_ID="G8iYmvncvWsfHRrxZvKuPU6B2kcMj82Lpcf6og6SyMkW"
CLUSTER="devnet"
WORKDIR="noema-8004-program/noema-8004"

log() { printf "\n[+] %s\n" "$1"; }

log "0/6 Change dir to Anchor workspace: $WORKDIR"
cd "$WORKDIR"

log "1/6 Clean build"
anchor clean && anchor build

log "2/6 Deploy (upgrade if exists)"
anchor deploy --provider.cluster "$CLUSTER"

log "3/6 Fetch IDL"
anchor idl fetch "$PROGRAM_ID" --provider.cluster "$CLUSTER" > idl-after.json || echo "WARN: idl fetch failed"

log "4/6 Verify critical instructions"
grep -E '"name": "(stake_validator|claim_validator_rewards|unstake_validator_instant)"' idl-after.json || echo "WARN: Missing expected instruction(s)"

log "5/6 Show program summary"
solana program show "$PROGRAM_ID" --url "$CLUSTER" || echo "WARN: program show failed"

log "6/6 Done"

cat <<'EOF'
Post-Upgrade Checklist:
 - Explorer slot updated
 - IDL contains new instructions
 - Frontend .env VITE_PROGRAM_ID synced
 - Test stake & claim flows pass
EOF
