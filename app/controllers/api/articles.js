const models = require('./../../models');

exports.index = async ctx => {
  const articles = await models.Article.all({
    attributes: ['title', 'path', 'meta', 'directory', 'on_homepage'],
    where: {
      published: true
    }
  });
  ctx.body = articles.map(a => a.toJSON());
};
