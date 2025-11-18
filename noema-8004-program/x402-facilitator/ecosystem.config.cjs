module.exports = {
  apps: [
    {
      name: 'x402-facilitator',
      script: 'dist/server.js',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
