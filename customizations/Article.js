
module.exports = {
  timestamps: true,
  associate: ({ Article, datasource }) => {
    Article.loadFromGithub = async () => {
      const github = require('../lib/Github');

      let acts = [];
      let articles = await github.getArticles();

      for (let article of articles) {
        if (!(article && article.meta)) { continue; }
        if (article.dir === '.backups') { continue; }
        const path = `${article.path  }/${  article.name  }.md`;
        let oldArticle = await Article.findOne({
          where: { path }
        }, { logging: false });

        if (!oldArticle) {
          console.log('saving ', path, article.meta.on_homepage ? '... on homepage' : '');
          acts.push(Article.create({
            content: article.content,
            title: article.meta.title,
            meta: article.meta,
            directory: article.path,
            path,
            sha: article.md,
            onHomepage: article.meta.on_homepage,
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

    Article.compareToArticlesFromServer = async () => {
      const _ = require('lodash');
      let afs = require('./../lib/articles_from_server');

      afs = afs.filter(ref => /\.md/.test(ref.path));

      for (let serverArticle of afs) {
        serverArticle.path = `/${  serverArticle.path}`;
        let dbArticle = await Article.findOne({ where: {
          path: serverArticle.path
        } });

        if (!dbArticle) {
          console.log('cannot find article ', serverArticle.path, 'in db');
        }else  {
          if (_.trim(dbArticle.title) !== serverArticle.title) {
            console.log(`title difference: [${  _.trim(dbArticle.title)  }] > server >[${  serverArticle.title}]`);
          }
          if (serverArticle.on_homepage !== dbArticle.onHomepage) {
            console.log(`on_homepage difference: ${  dbArticle.on_homepage  } > server > ${  serverArticle.on_homepage}`);
          }
        }
      }
    };
  }
};
