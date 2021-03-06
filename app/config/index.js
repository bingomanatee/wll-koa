'use strict';

const dotenv = require('dotenv');

const env = process.env.NODE_ENV || 'development';
// Load environment variables from .env file
dotenv.config();
if (env !== 'production') {
  dotenv.config({ path: `.env.${ env}` });
}

const configs = {
  base: {
    env,
    name: process.env.APP_NAME || 'wonderland-labs',
    host: process.env.APP_HOST || '0.0.0.0',
    port: 7070
  },
  production: {
    port: process.env.PORT || 8080
  },
  development: {
  },
  test: {
    port: 7072,
  }
};
const config = Object.assign({}, configs.base, configs[env]);

module.exports = config;
