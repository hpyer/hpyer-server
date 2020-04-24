'use strict';

const XssHandler = function (item) {
  if (Hpyer.isObject(item)) {
    let newItem = {};
    for (let k in item) {
      k = Hpyer.xssFilter(k);
      if (!k) continue;
      newItem[k] = XssHandler(item[k]);
    }
    return newItem;
  }
  else if (Hpyer.isArray(item)) {
    let newItem = [];
    for (let i=0; i<item.length; i++) {
      newItem[i] = XssHandler(item[i]);
    }
    return newItem;
  }
  else {
    return Hpyer.xssFilter(item);
  }
}

module.exports = async function (ctx, next) {
  if (ctx.path == '/favicon.ico') {
    return false;
  }

  Hpyer.log('[' + Hpyer.getClientIp(ctx.request) + ']', ctx.request.url);

  ctx.request.get = {};
  ctx.request.get_raw = {};
  if (ctx.request.query) {
    for (let k in ctx.request.query) {
      ctx.request.get[k] = XssHandler(ctx.request.query[k]);
      ctx.request.get_raw[k] = ctx.request.query[k];
    }
  }

  ctx.request.post = {};
  ctx.request.post_raw = {};
  if (ctx.request.body.params) {
    for (let k in ctx.request.body.params) {
      ctx.request.post[k] = XssHandler(ctx.request.body.params[k]);
      ctx.request.post_raw[k] = ctx.request.body.params[k];
    }
  }
  else if (ctx.request.body.fields) {
    for (let k in ctx.request.body.fields) {
      if (k == 'files') continue;
      ctx.request.post[k] = XssHandler(ctx.request.body.fields[k]);
      ctx.request.post_raw[k] = ctx.request.body.fields[k];
    }
  }
  else if (ctx.request.body) {
    for (let k in ctx.request.body) {
      if (k == 'files') continue;
      ctx.request.post[k] = XssHandler(ctx.request.body[k]);
      ctx.request.post_raw[k] = ctx.request.body[k];
    }
  }

  await next();
};
