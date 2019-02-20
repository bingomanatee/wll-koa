const models = require('./../../models');
const bottle = require('./../../../lib');
const { validateCtxAuth } = bottle.container;
const { UserMeta, UserMetum } = models;
const TOKEN =  process.env.AUTH0_API_TOKEN;

const userModel = UserMeta || UserMetum;

exports.getAuth = async (ctx) => {
  try {
    console.log('headers: ', ctx.header);

    let userAuth = await validateCtxAuth(ctx);

    if (userAuth && userAuth.found) {
      const dbUser = await userModel.findOne({ where: { sub: ctx.header.sub } });
      if (dbUser) {
        ctx.body = dbUser.toJSON();
        ctx.body.isAdmin = dbUser.is_admin;
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
    this.body = { isAdmin: false, error: err };
  }
};
