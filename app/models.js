const Sequelize = require('sequelize');
const models = require('../models');
const config = require('../config/config');
const customizations = require('../customizations');

const envConfig = config[process.env.NODE_ENV];
envConfig.logging = false;
const { username, database, password } = envConfig;

const sequelize = new Sequelize(database, username, password, envConfig);

models.init(sequelize);
models.datasource = sequelize;
for (const customization of Object.values(customizations)) {
  customization.associate && customization.associate(models);
}
module.exports = models;
