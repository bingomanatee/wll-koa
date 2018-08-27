'use strict';
module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define('Category', {
    directory: DataTypes.STRING,
    title: DataTypes.STRING,
    published: DataTypes.BOOLEAN,
    content: DataTypes.STRING,
    sequence: DataTypes.INTEGER
  }, {});
  Category.associate = function(models) {
    // associations can be defined here
  };
  return Category;
};