'use strict';

const Router = require('koa-router');
const homeController = require('./controllers/home');
const articleController = require('./controllers/api/articles');

const router = new Router();
router.get('/', homeController.getApiInfo);
router.get('/spec', homeController.getSwaggerSpec);

router.get('/api/articles', articleController.index);

module.exports = router;
