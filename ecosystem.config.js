// eslint-disable-next-line no-undef
module.exports = {
  apps: [
    {
      name: 'twitter',
      script: 'dist/index.js',
      env: {
        NODE_ENV: 'development',
        TEN_BIEN: 'Gia tri'
      },
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ]
}
