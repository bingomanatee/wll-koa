
module.exports = {
  timestamps: true,
  associate: ({ Article, datasource }) => {
    Article.loadFromGithub = async () => {
      const github = require('../lib/Github');
      const uuid = require('uuid/v1');

      let acts = [];
      let articles = await github.getArticles();

      for (let article of articles) {
        if (!(article && article.meta)) { continue; }
        if (article.dir === '.backups') { continue; }
        const path = `${article.path  }/${  article.name  }.md`;
        let oldArticle = await Article.findOne({
          where: { path }
        }, {logging: false});

        if (!oldArticle) {
          console.log('saving ', path);
          acts.push(Article.create({
            id: uuid(),
            content: article.content,
            title: article.meta.title,
            meta: article.meta,
            directory: article.path,
            path,
            sha: article.md,
            description: article.meta.intro || '',
            fileCreated: datasource.fn('Now'),
            fileRevised: datasource.fn('Now'),
            version: 1,
          }, { logging: false }));
        } else {
          console.warn('not overriding existing article: ', path);
        }
      }

      return Promise.all(acts);
    };
  }
};
