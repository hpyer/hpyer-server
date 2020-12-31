'use strict';

const { HpyerMiddleware } = require('../../dist');

module.exports = new HpyerMiddleware(async function (ctx, next) {
  ctx.request.is_ajax = true;
  await next();
});
