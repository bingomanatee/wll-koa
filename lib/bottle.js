const Bottle = require('bottlejs');

const auth0 = require('./auth0');
const Github = require('./Github');
const cleanPath = require('./cleanPath');

module.exports = () => {
  const bottle = new Bottle();

  auth0(bottle);
  bottle.factory('Github', () => Github);
  bottle.factory('cleanPath', () => cleanPath);

  return bottle;
};
