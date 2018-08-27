/* eslint new-cap: "off", global-require: "off" */

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Article', {
    id: {
      type: DataTypes.UUID,
      field: 'id',
      allowNull: false,
      primaryKey: true
    },
    title: {
      type: DataTypes.CHAR(80),
      field: 'title',
      allowNull: false
    },
    version: {
      type: DataTypes.INTEGER,
      field: 'version',
      allowNull: false
    },
    directory: {
      type: DataTypes.CHAR(80),
      field: 'directory',
      allowNull: false
    },
    path: {
      type: DataTypes.CHAR(160),
      field: 'path',
      allowNull: false
    },
    sha: {
      type: DataTypes.CHAR(160),
      field: 'sha',
      allowNull: false
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
        const uuid = require('uuid/v1');

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
            }, {
              logging: false
            }));
          } else {
            console.warn('not overriding existing article: ', path);
          }
        }

        return Promise.all(acts);
      };
    }
  });
};

module.exports.initRelations = () => {
  delete module.exports.initRelations;
  // Destroy itself to prevent repeated calls.
};
