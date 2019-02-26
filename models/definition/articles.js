/* eslint new-cap: "off", global-require: "off" */

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Article', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      field: 'id',
      allowNull: false,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      field: 'title',
      allowNull: false,
      get() {
        return this.getDataValue('title').trim();
      }
    },
    version: {
      type: DataTypes.INTEGER,
      field: 'version',
      allowNull: false
    },
    directory: {
      type: DataTypes.STRING,
      field: 'directory',
      allowNull: false,
      get() {
        const dir = this.getDataValue('directory');
        if (!(dir && (typeof dir === 'string'))) { return ''; }
        return dir.trim();
      }  },
    path: {
      type: DataTypes.STRING,
      field: 'path',
      allowNull: false,
      get() {
        const path = this.getDataValue('path');
        if (!(path && typeof path === 'string')) { return ''; }
        return path.trim();
      }
    },
    sha: {
      type: DataTypes.STRING,
      field: 'sha',
      allowNull: true
    },
    meta: {
      type: DataTypes.JSON,
      field: 'meta',
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      field: 'description',
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      field: 'content',
      allowNull: false
    },
    published: {
      type: DataTypes.BOOLEAN,
      field: 'published',
      allowNull: false,
      defaultValue: false
    },
    onHomepage: {
      type: DataTypes.BOOLEAN,
      field: 'on_homepage',
      allowNull: false,
      defaultValue: false
    },
    fileCreated: {
      type: DataTypes.DATE,
      field: 'file_created',
      allowNull: false
    },
    fileRevised: {
      type: DataTypes.DATE,
      field: 'file_revised',
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'createdAt',
      allowNull: false
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updatedAt',
      allowNull: false
    },
    deletedAt: {
      type: DataTypes.DATE,
      field: 'deletedAt',
      allowNull: true
    }
  }, {
    schema: 'public',
    tableName: 'articles',
    timestamps: true,
    associate: ({
      Article,
      datasource
    }) => {
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
            where: {
              path
            }
          }, {
            logging: false
          });

          if (!oldArticle) {
            console.log('saving ', path, article.meta);
            if (article.meta.on_homepage) { console.log('... on homepage'); }
            if (!article.meta.published) { console.log('... hidden'); }
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
            }, {
              logging: false
            }));
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
          let dbArticle = await Article.findOne({
            where: {
              path: `/${  serverArticle.path}`
            }
          });

          if (!dbArticle) {
            console.log('cannot find article ', serverArticle.path, 'in db');
          } else {
            if (_.trim(dbArticle.title) !== serverArticle.title) {
              console.log(`title difference: [${  _.trim(dbArticle.title)  }] > server >[${  serverArticle.title}]`);
            }
            if (serverArticle.on_homepage !== dbArticle.on_homepage) {
              console.log(`on_homepage difference: ${  dbArticle.on_homepage  } > server > ${  serverArticle.on_homepage}`);
            }
          }
        }
      };
    }
  });
};

module.exports.initRelations = () => {
  delete module.exports.initRelations;
  // Destroy itself to prevent repeated calls.
};
