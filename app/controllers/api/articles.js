const models = require('./../../models');

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

  console.log('path ---========= ', path);
  const article = await Article.findOne({
    where: {
      path
    }
  });

  ctx.body = article.toJSON();
};

exports.post = async ctx => {
  // @TODO: add auth from auth0

  const {
    content,
    path,
    title,
    published,
    on_homepage,
  } = ctx.body;

  const existing = await Article.find_by({ path });
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

exports.put = async ctx => {
  const {
    content,
    path,
    title,
    published,
    on_homepage,
  } = ctx.body;

  const existing = await Article.find_by({ path });
  if (!existing) {
    throw new Error(`article with path ${  path  } does not exist`);
  }

  Object.assign(existing, {
    content, title, published, on_homepage
  });
  await existing.save();

  ctx.body = existing.toJSON();
};
