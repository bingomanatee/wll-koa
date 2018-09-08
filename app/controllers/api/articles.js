const models = require('./../../models');
const bottle = require('./../../../lib');
const { validateCtxAuth } = bottle.container;
const { Article } = models;

exports.index = async ctx => {
  const articles = await Article.all({
    attributes: ['title', 'path', 'meta', 'published', 'directory', 'on_homepage', 'fileRevised'],
    where: {
      published: true
    }
  });
  ctx.body = articles.map(a => a.toJSON());
};

exports.homepage = async ctx => {
  const articles = await Article.all({
    attributes: ['title', 'path', 'meta', 'published', 'directory', 'on_homepage', 'fileRevised'],
    where: {
      published: true,
      on_homepage: true
    }
  });
  ctx.body = articles.map(a => a.toJSON());
};


exports.get = async ctx => {
  let path = decodeURI(ctx.params.path).replace(/(.json)?$/, '');
  const article = await Article.findOne({
    where: {
      path
    }
  });

  ctx.body = article.toJSON();
};

/**
 * new article
 * @param ctx
 * @returns {Promise<void>}
 */
exports.post = async ctx => {
  await validateCtxAuth(ctx);

  const {
    content,
    path,
    title,
    published,
    on_homepage,
  } = ctx.body;

  const existing = await Article.findOne({ path }).count();
  if (existing) {
    throw new Error(`article with path ${  path  } exists`);
  }

  const newArticle = await Article.create({
    content,
    path,
    title,
    published,
    on_homepage,
    version: 1,
    fileCreated: new Date(),
    fileRevised: new Date(),
    meta: {}
  });

  ctx.body = newArticle.toJSON();
};

/**
 * update article
 * @param ctx
 * @returns {Promise<void>}
 */
exports.put = async ctx => {
  await validateCtxAuth(ctx);
  const {
    content,
    path,
    title,
    published,
    on_homepage,
  } = ctx.body;

  const existing = await Article.findOne({ path });
  if (!existing) {
    throw new Error(`article with path ${  path  } does not exist`);
  }

  Object.assign(existing, {
    content, title, published, on_homepage, fileRevised: new Date(),
  });
  await existing.save();

  ctx.body = existing.toJSON();
};
