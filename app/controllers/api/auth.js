const models = require('./../../models');
const bottle = require('./../../../lib');
const { validateCtxAuth } = bottle.container;
const { UserMeta, UserMetum } = models;

const userModel = UserMeta || UserMetum;

exports.getAuth = async (ctx) => {
  try {
    console.log('headers: ', ctx.header);

    let userAuth = await validateCtxAuth(ctx);

    if (userAuth) {
      const dbUser = await userModel.findOne({ where: { sub: ctx.header.sub } });
      if (dbUser) {
        ctx.body = dbUser.toJSON();
      } else {
        ctx.body = { isAdmin: false };
      }
    } else {
      ctx.body = { isAdmin: false, error: 'cannot find sub ' + ctx.header.sub };
    }
  } catch (err) {
    console.log('error: ', err.message);
    this.body = { isAdmin: false, error: err.message };
  }
};
