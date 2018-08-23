'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const { sequelize } = queryInterface;
    return sequelize.transaction(async (transaction) => {
      await queryInterface.createTable('articles', {
        id: {
          type: Sequelize.UUID,
          primaryKey: true,
          defaultValue: Sequelize.UUIDV4,
        },

        title: {
          allowNull: false,
          type: Sequelize.CHAR(80)
        },

        version: {
          allowNull: false,
          type: Sequelize.INTEGER,
        },

        directory: {
          allowNull: false,
          type: Sequelize.CHAR(80),
        },

        path: {
          allowNull: false,
          type: Sequelize.CHAR(160),
        },

        sha: {
          allowNull: false,
          type: Sequelize.CHAR(160),
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
        created_at: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.fn('NOW'),
        },
        updated_at: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.fn('NOW'),
        },
        deleted_at: {
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
