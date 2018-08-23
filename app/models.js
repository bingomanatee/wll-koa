const Sequelize = require('sequelize');
const models = require('../models');
const config = require('../config/config');
const envConfig = config[process.env.NODE_ENV];
const { username, database, password } = envConfig;

const sequelize = new Sequelize(database, username, password, envConfig);

models.init(sequelize);

module.exports = models;
