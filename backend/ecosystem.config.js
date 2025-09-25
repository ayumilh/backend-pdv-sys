module.exports = {
  apps: [
    {
      name: "pdv-back",
      script: "dist/server.js",
      cwd: "/var/www/pdv/backend-pdv-sys/backend",
      env: {
        NODE_ENV: "production",
        PORT: 4005
      }
    }
  ]
}
