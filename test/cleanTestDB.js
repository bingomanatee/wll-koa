const models = require('../app/models');

module.exports = async () => {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('must initialize DB in test mode');
  }
  return Promise.all([
    models.Article.truncate()
  ]);
};
