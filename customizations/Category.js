
module.exports = {
  timestamps: true,
  associate: ({ Category, datasource }) => {
    Category.importServerCategories = async () => {
      let categories = require('../lib/categoeries');

      for (let category of categories) {
        console.log('category: ', category);
        let directory = `/${ category.directory}`;
        let existing = await Category.findOne({
          where: { directory }
        });
        if (existing) {
          console.log('not overwriting category: already exists');
        } else {
          delete category.created_at;
          delete category.updated_at;
          let cat = new Category(category);
          cat.directory = directory;
          await cat.save();
        }
      }
    };
  }
};
