'use strict';
module.exports = (sequelize, DataTypes) => {
  const UserMeta = sequelize.define('UserMeta', {
    sub: DataTypes.STRING,
    is_admin: DataTypes.BOOLEAN
  }, {});
  UserMeta.associate = function(models) {
    // associations can be defined here
  };
  return UserMeta;
};

module.exports.initRelations = () => {
  delete module.exports.initRelations;
  // Destroy itself to prevent repeated calls.
};
