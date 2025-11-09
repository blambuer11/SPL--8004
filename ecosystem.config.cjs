/**
 * PM2 ecosystem configuration for X402 Facilitator (CommonJS)
 */
module.exports = {
  apps: [
    {
      name: 'x402-facilitator',
      cwd: 'spl-8004-program/x402-facilitator',
      script: 'npm',
      args: 'run dev', // dev watch with tsx; use 'run start' for prod
      env_file: 'spl-8004-program/x402-facilitator/.env.facilitator',
      autorestart: true,
      watch: false,
      max_memory_restart: '300M'
    }
  ]
};
