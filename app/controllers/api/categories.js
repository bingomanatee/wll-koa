const _ = require('lodash');

const models = require('./../../models');
const { Category, Articles } = models;

exports.index = async ctx => {
  const categories = await Category.all({
    order: ['sequence']
  });
  ctx.body = categories.map(a => a.toJSON());
};


exports.get = async ctx => {
  let directory = ctx.params.directory;
  const directoryBuffer = Buffer.from(directory, 'base64');
  directory = directoryBuffer.toString();

  const category = await Category.findOne({
    where: {
      directory
    }
  });

  const articles = await Articles.find({
    where: { directory }
  });

  category.articles = articles.map(a => a.toJSON());

  ctx.body = category.toJSON();
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
    if (cat.directory === directory) { cat.sequence = seq; }
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
