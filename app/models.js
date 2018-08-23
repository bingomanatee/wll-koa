const sequelize = require('sequelize');
const models = require('../models');

models.init(sequelize);

module.exports = models;
