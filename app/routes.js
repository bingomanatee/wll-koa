'use strict';

const Router = require('koa-router');
const homeController = require('./controllers/home');
const artCont = require('./controllers/api/articles');
const catCont = require('./controllers/api/categories');
const authCont = require('./controllers/api/auth');

const router = new Router();
router.get('/', homeController.getApiInfo);
router.get('/spec', homeController.getSwaggerSpec);

router.get('/api/articles', artCont.index);
router.get('/api/homepage-articles', artCont.homepage);
router.get('/api/articles/:path', artCont.get);
router.post('/api/articles', artCont.post);
router.put('/api/articles/:id', artCont.put);

router.get('/api/categories', catCont.index);
router.get('/api/categories/:directory', catCont.get);
router.put('/api/categories/:directory', catCont.put);

router.post('/api/auth', authCont.getAuth);
router.options('/api/auth', (ctx)=> ctx.body = 'foo');

module.exports = router;
