
module.exports = {
  timestamps: true,
  associate: ({ Category }) => {
    Category.importServerCategories = async () => {
      let categories = require('../lib/categoeries');

      for (let category of categories) {
        let directory = category.directory;
        let existing = await Category.findOne({
          where: { directory }
        });
        if (existing) {
          console.log(`not overwriting category ${  directory  }: already exists`);
        } else {
          delete category.created_at;
          delete category.updated_at;
          await Category.create(category);
        }
      }
    };
  }
};
