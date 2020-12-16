'use strict';

import * as Utils from '../Utils';
import LogLevel from 'loglevel';
import RequestIp from 'request-ip';
import { Context, Next } from 'koa';

const XssHandler = function (item: any): any {
  if (Utils.isObject(item)) {
    let newItem = {};
    for (let k in item) {
      k = Utils.xssFilter(k);
      if (!k) continue;
      newItem[k] = XssHandler(item[k]);
    }
    return newItem;
  }
  else if (Utils.isArray(item)) {
    let newItem = [];
    for (let i = 0; i < item.length; i++) {
      newItem[i] = XssHandler(item[i]);
    }
    return newItem;
  }
  else {
    return Utils.xssFilter(item);
  }
}

export default async function (ctx: Context, next: Next) {
  if (ctx.path == '/favicon.ico') {
    return false;
  }

  ctx.request.client_ip = RequestIp.getClientIp(ctx.request);

  LogLevel.info('[' + ctx.client_ip + ']', ctx.request.url);

  ctx.request.query_raw = {};
  if (ctx.request.query) {
    for (let k in ctx.request.query) {
      ctx.request.query_raw[k] = ctx.request.query[k];
      ctx.request.query[k] = XssHandler(ctx.request.query[k]);
    }
  }
  else {
    ctx.request.query = {};
  }

  ctx.request.post = {};
  ctx.request.post_raw = {};
  if (ctx.request['body'].params) {
    for (let k in ctx.request['body'].params) {
      ctx.request.post_raw[k] = ctx.request['body'].params[k];
      ctx.request.post[k] = XssHandler(ctx.request['body'].params[k]);
    }
  }
  else if (ctx.request['body'].fields) {
    for (let k in ctx.request['body'].fields) {
      if (k == 'files') continue;
      ctx.request.post_raw[k] = ctx.request['body'].fields[k];
      ctx.request.post[k] = XssHandler(ctx.request['body'].fields[k]);
    }
  }
  else if (ctx.request['body']) {
    for (let k in ctx.request['body']) {
      if (k == 'files') continue;
      ctx.request.post_raw[k] = ctx.request['body'][k];
      ctx.request.post[k] = XssHandler(ctx.request['body'][k]);
    }
  }

  await next();
};
