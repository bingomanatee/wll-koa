module.exports = {
  timestamps: true,
  associate: ({ Article, datasource }) => {
    Article.loadFromGithub = async () => {
      const github = require('../lib/Github');

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
          console.log('saving ', path, article.meta.on_homepage ? '... on homepage' : '');
          acts.push(Article.create({
            content: article.content,
            title: article.meta.title,
            meta: article.meta,
            directory: article.path,
            path,
            published: !article.meta.hide,
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
      const diff = require('diff');

      let afs = require('./../lib/articles_from_server');

      afs = afs.filter(ref => /\.md/.test(ref.path));

      /**
       * note - not at this point caring about articles in the DB
       * that are NOT in the serverArticle list.
       */
      for (let serverArticle of afs) {
        if (!/\/[^/]+\.md$/.test(serverArticle.path)) { continue; }
        serverArticle.path = `/${  serverArticle.path}`;
        let dbArticle = await Article.findOne({
          where: {
            path: serverArticle.path
          }
        });

        if (!dbArticle) {
          console.log('cannot find article ', serverArticle.path, 'in db');
          serverArticle.fileCreated = new Date();
          serverArticle.fileRevised = new Date();
          serverArticle.sha = '(from server)';
          serverArticle.directory = serverArticle.path.replace(/\/[^/]+\.md$/, '');
          serverArticle.version = 1;
          if (!serverArticle.meta) {
            serverArticle.meta = {};
          }
          if (!serverArticle.description) {
            serverArticle.description = '';
          }
          await Article.create(serverArticle);
        } else {
          let changed = false;
          if (dbArticle.title !== serverArticle.title) {
            console.log(`title difference: [${ dbArticle.title  }] > server >[${  serverArticle.title}]`);
            dbArticle.title = serverArticle.title;
            changed = true;
          }
          if (serverArticle.on_homepage !== dbArticle.onHomepage) {
            console.log(`on_homepage difference: ${  dbArticle.on_homepage  } > server > ${  serverArticle.on_homepage}`);
            dbArticle.on_homepage = serverArticle.on_homepage;
            changed = true;
          }
          if (serverArticle.published !== dbArticle.published) {
            console.log(`published difference: ${  dbArticle.published  } > server > ${  serverArticle.published}`);
            dbArticle.published = serverArticle.published;
            changed = true;
          }
          if (serverArticle.content !== dbArticle.content) {
            console.log('content difference ', diff.diffLines(serverArticle.content, dbArticle.content));
            dbArticle.content = serverArticle.content;
            changed = true;
          }
          if (changed) {
            console.log(`${dbArticle.path  } changed`);
            dbArticle.save();
          }
        }
      }
    };
  }
};
