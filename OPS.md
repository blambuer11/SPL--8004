# Operations Runbook

This runbook keeps the facilitator (X402) service always-on locally and documents how to operate the stack.

## Services

- Frontend (agent-aura-sovereign): Deployed to Vercel. Local dev optional.
- X402 Facilitator (local): Express/TypeScript server on http://localhost:3001, managed by PM2.

## Quick status

```bash
# Health check
curl -s http://localhost:3001/health | jq . || curl -s http://localhost:3001/health

# PM2 process list
pm2 status
```

## Start/Stop/Logs (PM2)

```bash
# Start (or restart) the facilitator under PM2
cd spl-8004-program/x402-facilitator
pm2 start ecosystem.config.cjs

# View logs (live)
pm2 logs x402-facilitator

# Stop / delete
pm2 stop x402-facilitator
pm2 delete x402-facilitator
```

## Rebuild after code changes

```bash
cd spl-8004-program/x402-facilitator
npm ci
npm run build
pm2 restart x402-facilitator
```

## Auto-start on login (macOS launchd)

Already configured:

```bash
sudo env PATH=$PATH:/Users/$USER/.nvm/versions/node/v20.19.4/bin pm2 startup launchd -u $USER --hp /Users/$USER
pm2 save
```

Notes:
- pm2 save persists the current process list (resurrected on login/boot).
- Re-run `pm2 save` whenever you add/remove PM2 apps.

## Environment

- Facilitator reads .env (see `spl-8004-program/x402-facilitator/.env.example`).
- Important vars: `PORT=3001`, `MOCK_MODE=true` (for demo), `NETWORK=solana-devnet`, USDC devnet mint.

## Troubleshooting

- Port in use: free it, then restart
  ```bash
  lsof -ti:3001 | xargs kill -9 2>/dev/null || true
  pm2 restart x402-facilitator
  ```
- Health not OK: check logs
  ```bash
  pm2 logs x402-facilitator
  ```
- Log files growing too large: log rotation is installed via pm2-logrotate
  ```bash
  # show current configuration
  pm2 conf | sed -n '/pm2-logrotate/,$p'

  # defaults we set
  # max_size=10M, retain=14 days, compress=true, rotate daily at 00:00
  # change any value as needed, e.g. keep 30 days
  pm2 set pm2-logrotate:retain 30
  ```
- After macOS reboot and no process: resurrect
  ```bash
  pm2 resurrect || (pm2 start spl-8004-program/x402-facilitator/ecosystem.config.cjs && pm2 save)
  ```

## Frontend

- Vercel handles uptime for the site. Local dev:
  ```bash
  cd agent-aura-sovereign
  npm ci
  npm run dev
  ```
  Configure `VITE_X402_FACILITATOR_URL` to `http://localhost:3001` in `.env` for local.

## Agent demo (terminal)

End-to-end demo: register 2 agents, submit validation, update reputation, mock USDC transfer.

```bash
cd spl-8004-program/spl-8004
# ensure your devnet keypair path matches Anchor.toml or edit the script in package.json
npm run demo
```

Output shows: agent registration tx signatures, validation and reputation update tx signatures, and facilitator mock payment response.
