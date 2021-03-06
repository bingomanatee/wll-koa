const models = require('./../../models');
const bottle = require('./../../../lib');
const { validateCtxAuth } = bottle.container;
const { Article } = models;

exports.index = async ctx => {
  let isAdmin = false;
  let crit = {};
  try {
    const auth = await validateCtxAuth(ctx);
    isAdmin = auth.found;
  } catch (err) {
    isAdmin = false;
  }
  if (!isAdmin) {
    crit.published = true;
  }

  const articles = await Article.all({
    attributes: ['title', 'path', 'meta', 'published', 'directory', 'description', 'on_homepage', 'fileRevised'],
    where: crit
  });
  ctx.body = articles.map(a => a.toJSON());
};

exports.homepage = async ctx => {
  let isAdmin = false;
  let crit = {
    on_homepage: true
  };

  try {
    const auth = await validateCtxAuth(ctx);
    isAdmin = auth.found;
  } catch (err) {
    isAdmin = false;
  }

  if (!isAdmin) {
    crit.published = true;
  }
  const articles = await Article.all({
    attributes: ['title', 'path', 'meta', 'published', 'directory', 'description', 'on_homepage', 'fileRevised'],
    where: crit
  });
  ctx.body = articles.map(a => a.toJSON());
};

exports.get = async ctx => {
  let path = decodeURIComponent(ctx.params.path).replace(/\.[\w.]+$/, '') + '.md';
  console.log('getting path:', path);
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
  console.log('-------------- NEW ARTICLE');
  try {
    await validateCtxAuth(ctx);
  } catch (err) {
    console.log('new article cannot save - no auth', err);
    throw err;
  }

  const {
    content,
    path,
    title,
    published,
    onHomepage,
    description,
    filename,
    directory,
  } = ctx.request.body;


  try {
    const existing = await Article.findOne({ where: { path } });
    if (existing) {
      throw new Error(`article with path ${  path  } exists`);
    }
    const newArticle = await Article.create({
      content,
      path,
      title,
      published,
      onHomepage,
      filename,
      description,
      directory,
      version: 1,
      fileCreated: new Date(),
      fileRevised: new Date(),
      meta: {}
    });
    ctx.body = newArticle.toJSON();
    console.log('-------- saved', newArticle.toJSON());
  } catch (err) {
    console.log('-------- error saving;', err);
    throw err;
  }

};

/**
 * update article
 * @param ctx
 * @returns {Promise<void>}
 */
exports.put = async ctx => {
  console.log('putting article:', ctx.header);
  try {
    const isValid = await validateCtxAuth(ctx);
    console.log('valid', isValid);
  } catch (err) {
    console.log('error: ', err);
  }
  const {
    content,
    path,
    title,
    published,
    onHomepage,
  } = ctx.request.body;
  console.log(path, 'content: ', content);

  const existing = await Article.findOne({ where: { path } });
  if (!existing) {
    throw new Error(`article with path ${  path  } does not exist`);
  }

  Object.assign(existing, {
    content, title, published, onHomepage, fileRevised: new Date(),
  });
  await existing.save();

  ctx.body = existing.toJSON();
};
