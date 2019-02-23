const models = require('./../../models');
const bottle = require('./../../../lib');
const { validateCtxAuth } = bottle.container;
const { UserMeta, UserMetum } = models;

const userModel = UserMeta || UserMetum;

exports.getAuth = async (ctx) => {
  try {
    console.log('getAuth:headers: ', ctx.header.sub, ctx.header.access_token);

    let userAuth = await validateCtxAuth(ctx);

    if (userAuth && userAuth.found) {
      const dbUser = await userModel.findOne({ where: { sub: ctx.header.sub } });
      if (dbUser) {
        ctx.body = dbUser.toJSON();
        ctx.body.isAdmin = ctx.body.is_admin;
        ctx.body.translated = true;
      } else {
        ctx.body = { isAdmin: false };
      }
    } else {
      ctx.body = {
        isAdmin: false,
        error: 'userAuth is invalid',
        userAuth: userAuth,
      };
    }
  } catch (err) {
    console.log('getAuth:error --- ', err);
    this.body = { isAdmin: false, error: err };
  }
};
