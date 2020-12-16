'use strict';

module.exports = async function (ctx, next) {
  ctx.request.is_ajax = true;
  next();
};
