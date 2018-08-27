/* eslint global-require: "off" */
const model = {};
let initialized = false;

/**
 * Initializes sequelize models and their relations.
 * @param   {Object} sequelize  - Sequelize instance.
 * @returns {Object}            - Sequelize models.
 */
function init(sequelize) {
  delete module.exports.init;
  // Destroy itself to prevent repeated calls and clash with a model named 'init'.
  initialized = true;
  // Import model files and assign them to `model` object.
  model.SequelizeMetum = sequelize.import('./definition/sequelize-meta.js');
  model.Article = sequelize.import('./definition/articles.js');
  model.Category = sequelize.import('./definition/category.js');

  // All models are initialized. Now connect them with relations.
  require('./definition/sequelize-meta.js').initRelations();
  require('./definition/articles.js').initRelations();
  require('./definition/category.js').initRelations();
  return model;
}

// Note: While using this module, DO NOT FORGET FIRST CALL model.init(sequelize). Otherwise you get undefined.
module.exports = model;
module.exports.init = init;
module.exports.isInitialized = initialized;
