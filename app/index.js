#!/usr/bin/env node
'use strict';

let http = require('http');
// Load APM on production environment
const path = require('path');
const config = require('./config');
const apm = require('./apm');

const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const cors = require('@koa/cors');
const errorHandler = require('./middlewares/errorHandler');
// const logMiddleware = require('./middlewares/log');
const logger = require('./logger');
const requestId = require('./middlewares/requestId');
const responseHandler = require('./middlewares/responseHandler');
const router = require('./routes');
const serve = require('koa-static');


const app = new Koa();

// Trust proxy
app.proxy = true;

// Set middlewares
const staticPath = path.resolve(`${__dirname  }/../public`);
app.use(serve(staticPath));
app.use(
  bodyParser({
    enableTypes: ['json', 'form'],
    formLimit: '10mb',
    jsonLimit: '10mb'
  })
);
app.use(requestId());
app.use(
  cors({
    origin: '*',
    allowMethods: ['GET', 'HEAD', 'PUT', 'POST', 'DELETE', 'PATCH'],
    exposeHeaders: ['X-Request-Id']
  })
);
app.use(responseHandler());
app.use(errorHandler());
// app.use(logMiddleware({ logger }));

// Bootstrap application router
app.use(router.routes());
app.use(router.allowedMethods());

function onError(err, ctx) {
  if (apm.active) {
    apm.captureError(err);
  }
  if (ctx == null) {
    console.log(`Unhandled exception: ${  err.messag}`);
  }
}

// Handle uncaught errors
app.on('error', onError);

// Start server
if (!module.parent) {
  const server = app.listen(config.port, config.host, () => {
    console.log(`API server listening on ${config.host}:${config.port}, in ${config.env}`);

    if (process.env.NODE_ENV === 'production') {
      setInterval(function () {
        http.get('http://wonderland-labs.herokuapp.com/api/articles');
      }, 100000);
    }
  });
  server.on('error', onError);
}

// Expose app
module.exports = app;
