'use strict';

const Router = require('koa-router');
const homeController = require('./controllers/home');
const artCont = require('./controllers/api/articles');
const catCont = require('./controllers/api/categories');

const router = new Router();
router.get('/', homeController.getApiInfo);
router.get('/spec', homeController.getSwaggerSpec);

router.get('/api/articles', artCont.index);
router.get('/homepage-articles', artCont.homepage);
router.get('/api/articles/:id', artCont.get);
router.post('/api/articles', artCont.post);
router.put('/api/articles/:id', artCont.put);

router.get('/api/categories', catCont.index);
router.get('/api/categories/:directory', catCont.get);
router.put('/api/categories/:directory', catCont.put);

module.exports = router;
