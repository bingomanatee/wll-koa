'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const { sequelize } = queryInterface;
    await sequelize.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

    return sequelize.transaction(async (transaction) => {
      await queryInterface.createTable('articles', {
        id: {
          type: Sequelize.UUID,
          primaryKey: true,
          allowNull: false,
          defaultValue: Sequelize.UUIDV1,
        },

        title: {
          allowNull: false,
          type: Sequelize.STRING
        },

        version: {
          allowNull: false,
          type: Sequelize.INTEGER,
        },

        directory: {
          allowNull: false,
          type: Sequelize.STRING,
        },

        path: {
          allowNull: false,
          type: Sequelize.STRING,
          unique: true,
        },

        sha: {
          allowNull: false,
          type: Sequelize.STRING,
        },

        meta: {
          allowNull: false,
          type: Sequelize.JSON
        },

        description: {
          allowNull: false,
          type: Sequelize.TEXT,
        },


        content: {
          allowNull: false,
          type: Sequelize.TEXT,
        },

        published: {
          allowNull: false,
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },

        on_homepage: {
          allowNull: false,
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },

        file_created: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.fn('NOW'),
        },

        file_revised: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.fn('NOW'),
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        deletedAt: {
          type: Sequelize.DATE,
          allowNull: true,
          defaultValue: null,
        },
      }, { transaction });
    });
  },

  async down(queryInterface) {
    const { sequelize } = queryInterface;

    return sequelize.transaction(async (transaction) => {
      await queryInterface.dropTable('articles', { transaction });
    });
  },
};
