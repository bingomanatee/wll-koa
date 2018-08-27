const glob = require('glob');
const path = require('path');

module.exports = {};

glob
  .sync(
    '*.js',
    {
      cwd: __dirname,
      ignore: ['index.js'],
    }
  )
  .forEach((file) => {
    const name = path.basename(file, '.js');
    // eslint-disable-next-line global-require, import/no-dynamic-require
    module.exports[name] = require(path.resolve(__dirname, file));
  });
