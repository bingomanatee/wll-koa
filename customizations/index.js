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
  .map((file) => path.basename(file, '.js'))
  .forEach((name) => {
    // eslint-disable-next-line global-require, import/no-dynamic-require
    module.exports[name] = require(path.resolve(__dirname, file));
  });
