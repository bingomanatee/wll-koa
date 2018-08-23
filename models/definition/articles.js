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
      field: 'created_at',
      allowNull: false
    },
    updatedAt: {
      type: DataTypes.DATE,
      field: 'updated_at',
      allowNull: false
    },
    deletedAt: {
      type: DataTypes.DATE,
      field: 'deleted_at',
      allowNull: true
    }
  }, {
    schema: 'public',
    tableName: 'articles',
    timestamps: false
  });
};

module.exports.initRelations = () => {
  delete module.exports.initRelations;
  // Destroy itself to prevent repeated calls.
};
