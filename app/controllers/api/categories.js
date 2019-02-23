const _ = require('lodash');

const models = require('./../../models');
const { Category, Article } = models;

exports.index = async ctx => {
  console.log('getting index of categories');
  const categories = await Category.all({
    order: ['sequence']
  });
  ctx.body = categories.map(a => a.toJSON());
};


exports.get = async ctx => {
  const directory = decodeURI(ctx.params.directory).replace(/\.json$/, '');
  console.log('getting dir ', directory);
  let category = await Category.findOne({
    where: {
      directory
    }
  });

  if (!category) {
    console.log('category not found for ', directory);
    ctx.status = 404;
    ctx.message = `cannot find directory ${  directory}`;
    return;
  }

  category = category.toJSON();
  ctx.assert(category);

  const articles = await Article.findAll({
    where: { directory },
    attributes: ['path', 'id', 'directory', 'description', 'title', 'on_homepage', 'published', 'fileRevised']
  });

  try {
    category.articles = articles.map(a => a.toJSON());
  } catch (err) {
    console.log('error: ', err);
  }

  console.log('body:', category);
  ctx.body = category;
};

exports.put = async ctx => {
  let directory = ctx.params.directory;
  const directoryBuffer = Buffer.from(directory, 'base64');
  directory = directoryBuffer.toString();

  let {
    title, content, published
  } = ctx.body;

  const category = await Category.findOne({
    where: {
      directory
    }
  });

  Object.assign(category, {
    title, content, published
  });

  await category.save();

  ctx.body = category.toJSON();
};

exports.resequence = async ctx => {
  let directory = ctx.params.directory;
  const directoryBuffer = Buffer.from(directory, 'base64');
  directory = directoryBuffer.toString();
  const seq = Number.parseFloat(ctx.params.sequence);

  // get all the categories
  let categories = await Category.all({
    order: ['sequence']
  });

  // update the sequence value of the category.
  // note as a float value sequence may not be a saveable value
  for (let cat of categories) {
    if (cat.directory === directory) {
      cat.sequence = seq;
    }
  }

  // resort the categories based on the updated sequence
  categories = _.sortBy(categories, 'sequence');

  // update each sequence in the database
  // as an ascending integer. (fixes the problem noted above)

  let sequence = 1;
  for (let cat of categories) {
    await cat.update({ sequence });
    sequence += 1;
  }

  // re-poll categories from the database

  categories = await Category.all({
    order: ['sequence']
  });

  // report as output
  ctx.body = categories.map(a => a.toJSON());
};
