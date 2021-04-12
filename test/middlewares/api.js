'use strict';

const { defineMiddleware } = require('../../dist');

module.exports = defineMiddleware(async function (ctx, next) {
  ctx.request.is_ajax = true;
  await next();
});
