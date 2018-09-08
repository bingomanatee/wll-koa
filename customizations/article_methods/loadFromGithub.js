


const github = require('../../lib/Github');
const cleanPath = require('../../lib/cleanPath');

module.exports = (Article, datasource) => {
  return async () => {
    let acts = [];
    let articles = await github.getArticles();

    for (let article of articles) {
      if (!(article && article.meta)) {
        continue;
      }
      if (article.dir === '.backups') {
        continue;
      }
      const path = `${article.path  }/${  article.name  }.md`;
      let oldArticle = await Article.findOne({
        where: { path }
      }, { logging: false });

      if (!oldArticle) {
        ((article, path) => {
          console.log('saving ', path, article.meta.on_homepage ? '... on homepage' : '');
          acts.push((() => Article.create({
              content: article.content,
              title: article.meta.title,
              meta: article.meta,
              directory: cleanPath(article.path),
              path: cleanPath(path),
              published: !article.meta.hide,
              sha: article.md,
              onHomepage: article.meta.on_homepage,
              description: article.meta.intro || '',
              fileCreated: datasource.fn('Now'),
              fileRevised: article.meta.revised,
              version: 1,
            }, { logging: false })
              .then(() => console.log('saved ', path))
              .catch(err => console.log('error saving ', path, err.message))
          )());
        })(article, path);
      } else {
        console.warn('not overriding existing article: ', path);
      }
    }

    return Promise.all(acts);
  };
};
