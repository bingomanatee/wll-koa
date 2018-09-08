const models = require('./app/models');

const Article = models.Article;

Article.cleanup().then(() => {
  Article.commitChangesToGithub();
});

