
const PROXY_CONFIG = {
  '/api/secure-on': {
    target: 'https://secure-on-dev.loca.lt',
    secure: false,
    changeOrigin: true,
    logLevel: 'debug',
  },
};

module.exports = PROXY_CONFIG;
