module.exports = {
  timestamps: true,
  associate: ({ Article, datasource }) => {
    Article.loadFromGithub = require('./article_methods/loadFromGithub')(Article, datasource);

    Article.commitChangesToGithub = require('./article_methods/commitChangesToGithub')(Article, datasource);

    Article.cleanup = async () => {
      let articles = await Article.findAll();

      for (let a of articles) {
        if (a.title = 'New Article') {
          if (a.meta && a.meta.title) {
            a.title = a.meta.title;
            await  a.save();
          }
        }
      }
    };

    Article.prototype.toBlob = require('./article_methods/toBlob')(Article, datasource);

    Article.compareToArticlesFromServer = async () => {
      const diff = require('diff');
      const MD_FILENAME_RE = /\/[^/]+\.md$/;

      let afs = require('./../lib/articles_from_server');

      afs = afs.filter(ref => /\.md/.test(ref.path));

      /**
       * note - not at this point caring about articles in the DB
       * that are NOT in the serverArticle list.
       */
      for (let serverArticle of afs) {
        if (!MD_FILENAME_RE.test(serverArticle.path)) { continue; }
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
          serverArticle.directory = serverArticle.path.replace(MD_FILENAME_RE, '');
          serverArticle.version = 1;
          if (!serverArticle.meta) {
            serverArticle.meta = {};
          }
          if (!serverArticle.description) {
            serverArticle.description = '';
          }
          (async (serverArticle) => {
            try {
              await Article.create(serverArticle);
            } catch (err) {
              console.log('error saving ', serverArticle.path);
              console.log(err);
            }
          })(serverArticle);
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
