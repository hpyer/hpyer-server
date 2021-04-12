'use strict';

import { HpyerServerConfig, HpyerLuaParams, HpyerModelMap, HpyerServiceMap, HpyerDbProvider, HpyerCacheProvider, HpyerTemplateProvider, HpyerServerKoaContext, HpyerServerKoaState, HpyerDbSqlTransactionClosure, HpyerServerKoaMiddleware } from '../Support/Types/Hpyer';

import Path from 'path';
import ChildProcess from 'child_process';

import * as Utils from '../Support/Utils';
import Controller from './Controller';
import Model from './Model';
import Templater from './Templater';

import ContractSql from '../Support/Database/Contracts/ContractSql';
import ContractCache from '../Support/Cache/Contracts/ContractCache';

import Koa, { Next } from 'koa';
import KoaBody from '../Support/KoaBody';
import KoaSession from 'koa-session';
import KoaStatic from 'koa-static';
import KoaRouter from 'koa-router';

import Logger from '../Support/Logger';
import IORedis from 'ioredis';
import BN from 'bn.js';


let modelInstances: HpyerModelMap = {};
let serviceInstances: HpyerServiceMap = {};

/**
 * 版本号
 */
export const version: string = require('../../package.json').version;

/**
 * 是否生产环境
 */
export const isProduction: boolean = process.env.NODE_ENV == 'production';

/**
 * 记录日志
 */
export const log = Logger;

/**
 * 常用工具
 */
export const utils = Utils;

/**
 * 配置项
 */
export let config: HpyerServerConfig = null;

/**
 * koa实例
 */
export let $koa: Koa = null;


let _templaters = {};
/**
 * 获取模版操作实例
 * @param provider 模版供应商
 */
export const getTemplater = function(provider: HpyerTemplateProvider = null): Templater {
  if (!_templaters[provider]) {
    _templaters[provider] = new Templater(provider);
  }
  return _templaters[provider];
}

/**
 * 获取数据库操作实例
 * @param {string} provider 数据库供应商
 */
export const getDB = function(provider: HpyerDbProvider = null): ContractSql {
  if (!config.db.enable) return null;
  if (!provider) provider = config.db.provider;

  try {
    let fetcher = require(`../Support/Database/Providers/Provider${Utils.toStudlyCase(provider)}`);
    return fetcher.default(config.db[provider]);
  }
  catch (e) {
    throw new Error(`Fail to instance cache '${provider}'.`);
  }
}

/**
 * 执行事务，执行完后自动提交或回滚
 * @param closure 要执行的闭包。该闭包需要接收一个 db 实例对象，以完成事务相关操作。闭包返回 false 表示需要回滚，返回其他则表示提交。
 * @param provider 数据库供应商
 * @return 闭包的返回值也是该方法的返回值
 */
export const transaction = async function(closure: HpyerDbSqlTransactionClosure, provider: HpyerDbProvider = null): Promise<any> {
  let db = getDB(provider);
  if (!db) return false;
  let res = await db.transaction(closure);
  db.disconnect();
  return res;
}

/**
 * 获取redis操作实例
 * @param  options redis选项，详见: https://github.com/luin/ioredis/blob/HEAD/API.md#new_Redis_new
 */
export const getRedis = function(options: IORedis.RedisOptions = null): IORedis.Redis {
  if (!options) {
    options = config.cache['redis'];
  }
  if (!config.cache.enable) return null;
  try {
    return new IORedis(options);
  }
  catch (e) {
    log.error(`Fail to create Redis client.`, e);
  }
  return null;
}

let _cachers = {};
/**
 * 获取缓存操作实例
 * @param  {string} provider 缓存驱动，可选值：file, redis
 */
export const getCacher = function(provider: HpyerCacheProvider = null): ContractCache {
  if (!config.cache.enable) return null;
  if (!provider) provider = config.cache.provider;
  try {
    if (!_cachers[provider]) {
      let fetcher = require(`../Support/Cache/Providers/Provider${Utils.toStudlyCase(provider)}`);
      _cachers[provider] = fetcher.default(config.cache[provider]);
    }
    return _cachers[provider];
  }
  catch (e) {
    throw new Error(`Fail to instance cache '${provider}'.`);
  }
}

/**
 * 判断缓存是否存在
 * @param  {string} name 缓存名称
 * @param  {string} provider 缓存驱动，可选值：file, redis
 */
export const hasCache = async function(name: string, provider: HpyerCacheProvider = null): Promise<boolean> {
  let cacher: ContractCache = getCacher(provider);
  if (!cacher) return null;
  return cacher.has(name);
}

/**
 * 获取缓存值
 * @param  {string} name 缓存名称
 * @param  {string} provider 缓存驱动，可选值：file, redis
 */
export const getCache = async function(name: string, provider: HpyerCacheProvider = null): Promise<any> {
  let cacher: ContractCache = getCacher(provider);
  if (!cacher) return null;
  return cacher.get(name);
}

/**
 * 设置缓存
 * @param  {string} name 缓存名称
 * @param  {any} value 缓存值
 * @param  {integer} expireIn 时效，过期秒数，单位：秒，可选
 * @param  {string} provider 缓存驱动，可选值：file, redis
 */
export const setCache = async function(name: string, value: any = null, expireIn: number = 0, provider: HpyerCacheProvider = null): Promise<boolean> {
  let cacher: ContractCache = getCacher(provider);
  if (!cacher) return false;
  return cacher.set(name, value, expireIn);
}

/**
 * 删除缓存
 * @param  {string} name 缓存名称
 * @param  {string} provider 缓存驱动，可选值：file, redis
 */
export const removeCache = async function(name: string, provider: HpyerCacheProvider = null): Promise<boolean> {
  let cacher: ContractCache = getCacher(provider);
  if (!cacher) return false;
  return cacher.del(name);
}

/**
 * 获取model实例
 * @param  {string} name 服务名称
 * @param  {string} module 模块名称
 */
export const model = function(name: string, module: string = null) {
  try {
    let tag = name;
    if (module) tag = module + '-' + name;
    if (!modelInstances[tag]) {
      let modelClass;
      try {
        let path: string = config.root.models;
        if (module) {
          path = config.root.modules + '/' + module + '/' + config.defaultModelDir + '/';
        }
        log.debug('model', path + name);
        modelClass = require(path + name);
      }
      catch (e) {
        modelClass = class extends Model { };
      }
      modelInstances[tag] = new (modelClass);
      if (!modelInstances[tag].table) {
        modelInstances[tag].table = Utils.toLineCase(name, '_');
      }
    }
    return modelInstances[tag];
  }
  catch (e) {
    log.error('Model `' + name + '` not found.', e);
    throw e;
  }
};


/**
 * 获取service实例
 * @param  {string} name 服务名称
 */
export const service = function(name: string) {
  try {
    if (!serviceInstances[name]) {
      let path = config.root.services;
      serviceInstances[name] = new (require(path + name));
    }
    return serviceInstances[name];
  }
  catch (e) {
    log.error('Service `' + name + '` not found.', e);
    throw e;
  }
};

/**
 * Koa的控制器处理方法
 */
export const KoaHandler = function(ctx: Koa.Context, next: Koa.Next): Promise<Koa.Next> {
  let module = ctx.params.module || config.defaultModuleName;
  let controller = ctx.params.controller || config.defaultControllerName;
  let action = ctx.params.action || config.defaultActionName;

  return ControllerHandler(module, controller, action, ctx, next);
}

/**
 * 控制器处理方法
 * @param  module 应用名称
 * @param  controller 控制器名称
 * @param  action 方法名称
 * @param  ctx koa的上下文
 * @param  next oa的下一中间件
 */
export const ControllerHandler = async function(module: string, controller: string, action: string, ctx: Koa.Context = null, next: Koa.Next = null): Promise<Koa.Next> {
  module = module || config.defaultModuleName;
  controller = controller || config.defaultControllerName;
  action = action || config.defaultActionName;
  let instance: Controller;
  try {
    let path = Path.resolve(config.root.modules + '/' + module + '/' + config.defaultControllerDir + '/') + '/';
    log.debug('controller', path + controller);
    instance = new (require(path + controller));
  }
  catch (e) {
    log.error('Controller `' + controller + '` not found.', e);
    if (ctx) ctx.response.status = 404;
    return next ? await next() : false;
  }
  if (!Utils.isFunction(instance[action + 'Action'])) {
    log.error('Action `' + action + '` not found.');
    if (ctx) ctx.response.status = 404;
    return next ? await next() : false;
  }

  // 注入相关实例、变量等
  instance.module = module;
  instance.controller = controller;
  instance.action = action;
  instance.ctx = ctx;

  instance.isPost = ctx && ctx.request.method == 'POST';
  instance.isCli = !ctx && true;

  try {
    let res;
    if (Utils.isFunction(instance.__before)) {
      res = await instance.__before();
      if (false === res) return next ? await next() : false;
    }

    await instance[action + 'Action']();

    if (Utils.isFunction(instance.__after)) {
      res = await instance.__after();
      if (false === res) return next ? await next() : false;
    }
  }
  catch (e) {
    log.error('Action `' + action + '` occurred a fatal error.', e);

    ctx.status = 500;
    if (Utils.isAjaxRequest(ctx)) {
      ctx.type = 'application/json';
      ctx.body = Utils.jsonError('Server Error', '500');
    }
    else {
      ctx.type = 'text/html';
      ctx.body = getTemplater().renderError({
        success: false,
        message: 'Server Error',
        code: '500',
        waitSecond: 0,
        jumpUrl: ''
      });
    }
    return next ? await next() : false;
  }
}


let _redisClient: IORedis.Redis = null;
/**
 * 在redis中执行lua脚本
 * @param  content 脚本内容
 * @param  params [{key: 'test', value: 10}, {key: 'test', value: 10}]
 */
export const runLuaInRedis = async function(script: string, params: Array<HpyerLuaParams> = null) {
  try {
    if (!script) throw new Error('NO lua script');
    let args: Array<string | number> = [script];
    if (params && params.length > 0) {
      let keys: Array<string> = [], values: Array<string> = [];
      for (let i in params) {
        if (params[i].key) {
          keys.push(params[i].key);
          values.push(params[i].value || '');
        }
      }
      args.push(keys.length);
      args = args.concat(keys, values);
    }
    else {
      args.push(0);
    }
    if (!_redisClient) {
      _redisClient = getRedis();
    }
    let res = await _redisClient.eval(args);
    return res;
  }
  catch (e) {
    log.error(`Fail to run lua script in redis.`, e);
  };
  return false;
}

/**
 * 执行系统命令
 * @param  {string} cmd 命令
 * @param  {array} args 参数，可选
 */
export const runCmd = function(cmd, args = []) {
  return new Promise((resolve, reject) => {
    Logger.info('Run command', cmd, args);
    let job = ChildProcess.spawn(cmd, args);
    let data_buffers = [];
    let error_buffers = [];
    job.stdout.on('data', function (data) {
      data_buffers.push(data);
    });
    job.stderr.on('data', function (data) {
      error_buffers.push(data);
    });
    job.on('exit', function (code) {
      let data = Buffer.concat(data_buffers).toString();
      let error = Buffer.concat(error_buffers).toString();
      Logger.info('After run command', data);
      if (error) {
        reject(error);
      }
      resolve(data);
    });
  });
};

/**
 * 生成唯一id（雪花算法 Snowflake）
 * @param second 秒数，13位
 * @param microSecond 毫秒数，3位
 * @param machineId 机器id，可理解为不同业务场景，2^8，可选值：0~255
 * @param count 计数，2^14，可选值：0~16383
 */
export const buildUniqueId = function(second: number, microSecond: number, machineId: number | string, count: number): string {
  let miliSecond = second * 1000 + microSecond - config.uniqueId.epoch;
  // 0 + 41位毫秒时间戳 + 8机器id + 14位自增序列
  let base = '0' + utils.pad(miliSecond.toString(2), 41, '0', true) + utils.pad(machineId.toString(2), 8, '0', true) + utils.pad(count.toString(2), 14, '0', true);
  var id_bit = new BN(base, 2);
  return id_bit.toString();
};

/**
 * 获取唯一id（雪花算法 Snowflake）
 * @param machineId 机器id，可理解为不同业务场景，2^8，可选值：0~255
 */
export const getUniqueId = async function(machineId: number | string = 0): Promise<string> {
  let luaScript = `redis.replicate_commands()
local STEP = 1;
local MAX_COUNT = 16384;
local MAX_MACHINES = 256;
local now = redis.call('TIME');
local tag = KEYS[1];
local machineId;
if ARGV[1] == nil then
machineId = 0;
else
machineId = ARGV[1] % MAX_MACHINES;
end
local count;
count = tonumber(redis.call('HINCRBY', tag, machineId, STEP));
if count >= MAX_COUNT then
count = 0;
redis.call('HSET', tag, machineId, count);
end
return {tonumber(now[1]), tonumber(now[2]), machineId, count};`;

  let segments = await runLuaInRedis(luaScript, [
    { key: config.uniqueId.cacheKey, value: machineId.toString() }
  ]);
  // redis的毫秒是6位的，取前3位
  segments[1] = parseInt((segments[1] / 1000).toString());
  return buildUniqueId.apply(this, segments);
}

/**
 * 从唯一id中解析出时间戳（雪花算法 Snowflake）
 * @param id id
 */
export const parseUniqueId = function(id: string): object {
  let id_bit = new BN(id, 10);
  // 回填为64位
  let base = utils.pad(id_bit.toString(2), 64, '0', true);
  let timestamp = parseInt(base.substr(1, 41), 2) + config.uniqueId.epoch;
  let machineId = parseInt(base.substr(42, 8), 2);
  let count = parseInt(base.substr(50, 14), 2);
  return { timestamp, machineId, count };
}

/**
 * 启动服务
 * @param cfg 配置项
 */
export const startup = async function(cfg: HpyerServerConfig = null): Promise<void> {
  if (cfg) for (let k in cfg) {
    if (cfg[k] === null) continue;
    const DefaultConfig = (await import('../Support/DefaultConfig')).default;
    if (config === null) {
      config = DefaultConfig;
    }
    if (Utils.isObject(cfg[k])) {
      config[k] = Utils.extend({}, DefaultConfig[k], cfg[k]);
    }
    else if (Utils.isArray(cfg[k])) {
      config[k] = Utils.extend([], DefaultConfig[k], cfg[k]);
    }
    else {
      config[k] = cfg[k];
    }
  }

  if (!config.root.modules) {
    throw new Error('NOT set modules root');
  }
  if (!config.root.models) {
    throw new Error('NOT set models root');
  }
  if (!config.root.services) {
    throw new Error('NOT set services root');
  }
  if (!config.root.errors) {
    throw new Error('NOT set errors root');
  }
  config.root.modules = Utils.rtrim(config.root.modules, '\\/+') + '/';
  config.root.models = Utils.rtrim(config.root.models, '\\/+') + '/';
  config.root.services = Utils.rtrim(config.root.services, '\\/+') + '/';
  config.root.errors = Utils.rtrim(config.root.errors, '\\/+') + '/';

  // 系统请求处理方法
  let koaRouter = new KoaRouter;
  const MiddlewareRequest = (await import('../Support/Middlewares/Request')).default;
  koaRouter.use(MiddlewareRequest);
  // 自定义路由
  if (config.koa.routers && Utils.isArray(config.koa.routers)) {
    config.koa.routers.forEach(router => {
      if (router.path && Utils.isString(router.path)) {
        // 配置指定路由的中间件
        if (router.middleware) {
          if (Utils.isFunction(router.middleware) || Utils.isArray(router.middleware)) {
            try {
              koaRouter.use(router.path, router.middleware);
            }
            catch (e) {
              log.error('Invalid koa.middleware.', e);
            };
          }
        }
        // 增加路由处理方法
        if (router.handler && Utils.isFunction(router.handler)) {
          router.method = router.method || 'all';
          try {
            koaRouter[router.method](router.path, router.handler);
          }
          catch (e) {
            log.error('Invalid middleware.', e);
          };
        }
      }
    });
  }
  // 系统路由
  koaRouter.all('/', KoaHandler);
  koaRouter.all('/:module/:controller/:action', KoaHandler);
  koaRouter.all('/:controller/:action', KoaHandler);

  let argv2 = process.argv[2];
  if (argv2 && /^\/?[a-z]\w*/i.test(argv2)) {
    let matched = koaRouter.match(argv2, 'GET');
    if (matched.path.length > 0) {
      matched = Utils.matchAll(/\/([^\/]*)/gi, argv2);
      let module = '', controller = '', action = '';
      if (matched.length > 2) {
        module = matched[0][1];
        controller = matched[1][1];
        action = matched[2][1];
      }
      else {
        controller = matched[0][1];
        action = matched[1][1];
      }
      ControllerHandler(module, controller, action).then(() => {
        process.exit(0);
      });
    }
    else {
      log.error('Router `' + argv2 + '` not found');
    }
  }
  else {
    $koa = new Koa<HpyerServerKoaState, HpyerServerKoaContext>();

    $koa.keys = [config.key];

    $koa.use(KoaBody(config.koa.body));

    $koa.use(KoaSession(config.koa.session, $koa));

    if (config.koa.statics && Utils.isArray(config.koa.statics)) config.koa.statics.forEach(path => {
      $koa.use(KoaStatic(Path.resolve(path)));
    });

    $koa.use(koaRouter.routes()).use(koaRouter.allowedMethods());

    // 404
    $koa.use(async (ctx: HpyerServerKoaContext, next: Koa.Next) => {
      if (ctx.status === 404) {
        if (Utils.isAjaxRequest(ctx)) {
          ctx.type = 'application/json';
          ctx.body = utils.jsonError('Server Error', '500');
        }
        else {
          ctx.type = 'text/html';
          ctx.body = getTemplater().renderError({
            success: false,
            message: 'Page not found.',
            code: 404,
            waitSecond: 0,
            jumpUrl: ''
          });
        }
      }
    });

    $koa.listen(config.port, () => {
      log.info('Current ENV: ' + config.env);
      log.info('Framework version: ' + version);
      log.info('Listen port: ' + config.port);
    });
  }

}
