const AuthenticationClient = require('auth0').AuthenticationClient;

module.exports = (bottle) => {
  bottle.constant('AUTH0_API_DOMAIN', 'wonderlandabs.auth0.com');
  bottle.constant('AUTH0_API_TOKEN', process.env.AUTH0_API_TOKEN);
  bottle.factory('auth0', ({ AUTH0_API_TOKEN, AUTH0_API_DOMAIN }) => {
    console.log('auth0 info: ', AUTH0_API_TOKEN, AUTH0_API_DOMAIN);
    return new AuthenticationClient({
      domain: AUTH0_API_DOMAIN,
      clientId: AUTH0_API_TOKEN
    });
  });

  bottle.factory('auth0cache', () => new Map());

  bottle.factory('validateAuth0AccessToken', ({ auth0, auth0cache }) => (accessToken, sub) => {
    console.log('validateAuth0AccessToken: ', accessToken, sub);
    if (auth0cache.has(accessToken)) {
      const cachedSub = auth0cache.get(accessToken);
      console.log('comparing', cachedSub, 'to', sub);
      return { found: cachedSub === sub };
    }
    if (!(accessToken && sub)) {
      return Promise.reject({
        found: false,
        accessToken,
        sub
      });
    }

    return auth0.getProfile(accessToken)
      .then((result) => {
        if ((!result) || (result === 'Unauthorized')) {
          return {
            found: false,
            error: result,
            meta: { message: `cannot find profile for access token ${  accessToken}` }
          };
        }
        if (typeof result === 'string') {
          result = JSON.parse(result);
        }
        if (result.sub === sub) {
          auth0cache.set(accessToken, sub);
        }

        return {
          found: result.sub === sub,
          result
        };
      })
      .catch((err) => {
        console.log('validateAuth0AccessToken error: ', err.message);
        return {
          found: false,
          error: err
        };
      });
  });

  bottle.factory('validateCtxAuth', ({ validateAuth0AccessToken, AUTH0_API_TOKEN, AUTH0_API_DOMAIN }) => {
    return (ctx) => {
      console.log('validateCtxAuth: auth0 info: ', AUTH0_API_TOKEN, AUTH0_API_DOMAIN);
      const { sub, access_token } = ctx.header;
      console.log('headers: ', 'sub = ', sub, 'access-token = ', access_token);
      try {
        ctx.assert(sub);
        ctx.assert(access_token);
      } catch (err) {
        return {
          found: false,
          error: err,
          meta: {
            message: 'missing headers',
            sub,
            access_token
          }
        };
      }

      return validateAuth0AccessToken(access_token, sub);
    };
  });
};
