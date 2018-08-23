/* eslint new-cap: "off", global-require: "off" */

module.exports = (sequelize, DataTypes) => {
  return sequelize.define('SequelizeMetum', {
    name: {
      type: DataTypes.STRING(255),
      field: 'name',
      allowNull: false,
      primaryKey: true
    }
  }, {
    schema: 'public',
    tableName: 'SequelizeMeta',
    timestamps: false
  });
};

module.exports.initRelations = () => {
  delete module.exports.initRelations;
  // Destroy itself to prevent repeated calls.
};
