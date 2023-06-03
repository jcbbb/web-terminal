module.exports = {
  apps: [
    {
      name: "terminal",
      script: "./server.js",
      env_production: {
        NODE_ENV: "production",
        PORT: 8005
      },
      env_development: {
        NODE_ENV: "development",
        PORT: 3000
      }
    }
  ]
}
