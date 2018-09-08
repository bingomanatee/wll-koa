const AuthenticationClient = require('auth0').AuthenticationClient;

module.exports = (bottle) => {
  bottle.constant('AUTH0_API_DOMAIN', 'wonderworld.auth0.com');
  bottle.constant('AUTH0_API_TOKEN', process.env.AUTH0_API_TOKEN);
  bottle.factory('auth0', ({ AUTH0_API_TOKEN, AUTH0_API_DOMAIN }) => {
    return  new AuthenticationClient({
      domain: AUTH0_API_DOMAIN,
      clientId: AUTH0_API_TOKEN
    });
  });

  bottle.factory('auth0cache', () => new Map());

  bottle.factory('validateAuth0AccessToken', ({ auth0, auth0cache }) => (accessToken, sub) => {
    if (auth0cache.has(accessToken)) {
      const cachedSub =  auth0cache.get(accessToken);
      console.log('comparing', cachedSub, 'to', sub);
      return cachedSub === sub;
    }
    if (!(accessToken && sub)) { return Promise.resolve(false); }
    return auth0.getProfile(accessToken)
      .then((result)=> {
        if ((!result) || (result === 'Unauthorized')) { return false; }
        if (typeof result === 'string') {
          result = JSON.parse(result);
        }
        if (result.sub === sub) {
          auth0cache.set(accessToken, sub);
        }
        console.log('fetched token', accessToken, 'got', result.sub, 'against', sub);
        return result.sub === sub;
      })
      .catch((err) => {
        console.log('validateAuth0AccessToken error: ', err.message);
        return false;
      });
  });

  bottle.factory('validateCtxAuth', ({ validateAuth0AccessToken }) => {
    return async (ctx) => {
      const { sub, access_token } = ctx.header;
      ctx.assert(sub);
      ctx.assert(access_token);

      return await validateAuth0AccessToken(access_token, sub);
    };
  });
};
