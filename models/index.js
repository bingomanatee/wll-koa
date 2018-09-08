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
  model.UserMeta = sequelize.import('./definition/user-meta.js');

  // All models are initialized. Now connect them with relations.
  let meta = require('./definition/sequelize-meta.js');
  let articles = require('./definition/articles.js');
  let category = require('./definition/category.js');
  let userMeta = require('./definition/user-meta.js');
  [meta, articles, category, userMeta].forEach(model => {
    if (model && model.initRelations) {
      model.initRelations();
    }
  });

  return model;
}

// Note: While using this module, DO NOT FORGET FIRST CALL model.init(sequelize). Otherwise you get undefined.
module.exports = model;
module.exports.init = init;
module.exports.isInitialized = initialized;
