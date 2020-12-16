'use strict';

import { HpyerServerConfig, HpyerLuaParams, HpyerModelMap, HpyerServiceMap, HpyerDbProvider, HpyerCacheProvider } from '../Support/Types/Hpyer';

import Path from 'path';
import ChildProcess from 'child_process';

import * as Utils from '../Support/Utils';
import DefaultConfig from '../Support/DefaultConfig';
import Controller from './Controller';
import Model from './Model';
import Service from './Service';
import Templater from './Templater';

import ContractSql from '../Support/Database/Contracts/ContractSql';
import ContractCache from '../Support/Cache/Contracts/ContractCache';

import MiddlewareRequest from '../Support/Middlewares/Request';

import Koa from 'koa';
import KoaBody from '../Support/KoaBody';
import KoaSession from 'koa-session';
import KoaStatic from 'koa-static';
import KoaRouter from 'koa-router';

import Axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import LogLevel from 'loglevel';
import IORedis from 'ioredis';
import BN from 'bn.js';


let modelInstances: HpyerModelMap = {};
let serviceInstances: HpyerServiceMap = {};

/**
 * 框架
 */
class Application {

  /**
   * 版本号
   */
  version: string = require('../../package.json').version;

  /**
   * 是否生产环境
   */
  isProduction: boolean = process.env.NODE_ENV == 'production';

  /**
   * 记录日志
   */
  log = LogLevel;

  /**
   * 常用工具
   */
  utils = Utils;

  /**
   * 配置项
   */
  config: HpyerServerConfig = DefaultConfig;

  /**
   * koa实例
   */
  server: Koa = null;

  constructor() {
    if (this.isProduction) {
      this.log.setLevel(this.log.levels.INFO);
    }
    else {
      this.log.setLevel(this.log.levels.DEBUG);
    }
  }

  /**
   * 是否ajax请求
   * @param  {object}  ctx  koa的上下文
   */
  isAjax (ctx: Koa.Context) {
    let isAjax = false;
    if (ctx.isAjax || (ctx.request.header['x-requested-with'] && ctx.request.header['x-requested-with'] == 'XMLHttpRequest')) {
      isAjax = true;
    }
    return isAjax;
  };

  /**
   * 发起http请求
   * @param  payload  Axios请求参数，详见：https://www.npmjs.com/package/axios#request-config
   * @param  returnResponse  是否返回 AxiosResponse 对象，默认：false，表示直接返回 AxiosResponse.data
   */
  doRequest(payload: AxiosRequestConfig, returnResponse: boolean = false): Promise<any> {
    let start_time = (new Date).getTime();
    this.log.info(`doRequest_${start_time}`, payload);

    return Axios.request(payload).then((res: AxiosResponse) => {
      let end_time = (new Date).getTime();
      let log_data = res.data;
      if (payload.responseType == 'stream') {
        log_data = '[ReadableStream]';
      }
      else if (payload.responseType == 'arraybuffer') {
        log_data = '[Buffer]';
      }
      this.log.info(`doRequest.success_${start_time}`, `${end_time - start_time}ms`, log_data);

      return returnResponse ? res : res.data;
    }).catch(err => {
      let end_time = (new Date).getTime();
      this.log.error(`doRequest.error_${start_time}`, `${end_time - start_time}ms`, err.response.status, err.response.data);
      return null;
    });

  }

  /**
   * 获取数据库操作实例
   * @param {string} provider 数据库供应商
   */
  getDB(provider: HpyerDbProvider = null): ContractSql {
    if (!this.config.db.enable) return null;
    if (!provider) provider = this.config.db.provider;

    try {
      let fetcher = require(`../Support/Database/Providers/Provider${Utils.toStudlyCase(provider)}`);
      return fetcher.default(this.config.db[provider]);
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
  async transaction(closure: Function, provider: HpyerDbProvider = null): Promise<any> {
    let db = this.getDB(provider);
    if (!db) return false;
    let res = await db.transaction(closure);
    db.disconnect();
    return res;
  }

  /**
   * 获取redis操作实例
   * @param  options redis选项，详见: https://github.com/luin/ioredis/blob/HEAD/API.md#new_Redis_new
   */
  getRedis(options: IORedis.RedisOptions = null): IORedis.Redis {
    if (!options) {
      options = this.config.cache['redis'];
    }
    if (!this.config.cache.enable) return null;
    try {
      return new IORedis(options);
    }
    catch (e) {
      this.log.error(`Fail to create Redis client.`, e);
    }
    return null;
  }

  /**
   * 获取缓存操作实例
   * @param  {string} provider 缓存驱动，可选值：file, redis
   */
  getCacher(provider: HpyerCacheProvider = null): ContractCache {
    if (!this.config.cache.enable) return null;
    if (!provider) provider = this.config.cache.provider;
    try {
      let fetcher = require(`../Support/Cache/Providers/Provider${Utils.toStudlyCase(provider)}`);
      return fetcher.default(this.config.cache[provider]);
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
  async hasCache(name: string, provider: HpyerCacheProvider = null): Promise<boolean> {
    let cacher: ContractCache = this.getCacher(provider);
    if (!cacher) return null;
    return cacher.has(name);
  }

  /**
   * 获取缓存值
   * @param  {string} name 缓存名称
   * @param  {string} provider 缓存驱动，可选值：file, redis
   */
  async getCache(name: string, provider: HpyerCacheProvider = null): Promise<any> {
    let cacher: ContractCache = this.getCacher(provider);
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
  async setCache(name: string, value: any = null, expireIn: number = 0, provider: HpyerCacheProvider = null): Promise<boolean> {
    let cacher: ContractCache = this.getCacher(provider);
    if (!cacher) return false;
    return cacher.set(name, value, expireIn);
  }

  /**
   * 删除缓存
   * @param  {string} name 缓存名称
   * @param  {string} provider 缓存驱动，可选值：file, redis
   */
  async removeCache(name: string, provider: HpyerCacheProvider = null): Promise<boolean> {
    let cacher: ContractCache = this.getCacher(provider);
    if (!cacher) return false;
    return cacher.del(name);
  }

  /**
   * 获取model实例
   * @param  {string} name 服务名称
   * @param  {string} module 模块名称
   */
  model(name: string, module: string = null) {
    try {
      let tag = name;
      if (module) tag = module + '-' + name;
      if (!modelInstances[tag]) {
        let modelClass;
        try {
          let path: string = this.config.root.models;
          if (module) {
            path = this.config.root.modules + '/' + module + '/' + this.config.defaultModelDir + '/';
          }
          this.log.debug('model', path + name);
          modelClass = require(path + name);
        }
        catch (e) {
          modelClass = class extends Model { };
        }
        modelInstances[tag] = new (modelClass);
        if (!modelInstances[tag].table) {
          modelInstances[tag].table = Utils.toLineCase(name, '_');
        }

        // 注入相关实例、变量等
        modelInstances[name].app = this;
      }
      return modelInstances[tag];
    }
    catch (e) {
      this.log.error('Model `' + name + '` not found.', e);
      throw e;
    }
  };


  /**
   * 获取service实例
   * @param  {string} name 服务名称
   */
  service (name: string) {
    try {
      if (!serviceInstances[name]) {
        let path = this.config.root.services;
        serviceInstances[name] = new (require(path + name));
        // 注入相关实例、变量等
        serviceInstances[name].app = this;
      }
      return serviceInstances[name];
    }
    catch (e) {
      this.log.error('Service `' + name + '` not found.', e);
      throw e;
    }
  };

  /**
   * Koa的控制器处理方法
   */
  KoaHandler(): Function {
    return (ctx: Koa.Context, next: Koa.Next): Promise<Koa.Next> => {
      let module = ctx.params.module || this.config.defaultModuleName;
      let controller = ctx.params.controller || this.config.defaultControllerName;
      let action = ctx.params.action || this.config.defaultActionName;

      return this.ControllerHandler(module, controller, action, ctx, next);
    };
  }

  /**
   * 控制器处理方法
   * @param  module 应用名称
   * @param  controller 控制器名称
   * @param  action 方法名称
   * @param  ctx koa的上下文
   * @param  next oa的下一中间件
   */
  async ControllerHandler(module: string, controller: string, action: string, ctx: Koa.Context = null, next: Koa.Next = null): Promise<Koa.Next> {
    module = module || this.config.defaultModuleName;
    controller = controller || this.config.defaultControllerName;
    action = action || this.config.defaultActionName;
    let instance: Controller;
    try {
      let path = Path.resolve(this.config.root.modules + '/' + module + '/' + this.config.defaultControllerDir + '/') + '/';
      this.log.debug('controller', path + controller);
      instance = new (require(path + controller));
    }
    catch (e) {
      this.log.error('Controller `' + controller + '` not found.', e);
      if (ctx) ctx.response.status = 404;
      return next ? next() : false;
    }
    if (!Utils.isFunction(instance[action + 'Action'])) {
      this.log.error('Action `' + action + '` not found.');
      if (ctx) ctx.response.status = 404;
      return next ? next() : false;
    }

    // 注入相关实例、变量等
    instance.app = this;
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
        if (false === res) return next ? next() : false;
      }

      await instance[action + 'Action']();

      if (Utils.isFunction(instance.__after)) {
        res = await instance.__after();
        if (false === res) return next ? next() : false;
      }
    }
    catch (e) {
      this.log.error('Action `' + action + '` occurred a fatal error.', e);

      ctx.status = 500;
      if (this.isAjax(ctx)) {
        ctx.type = 'application/json';
        ctx.body = Utils.jsonError('Server Error', '500');
      }
      else {
        ctx.type = 'text/html';
        ctx.body = (new Templater(this)).renderError({
          success: false,
          message: 'Server Error',
          code: '500',
          waitSecond: 0,
          jumpUrl: ''
        });
      }
      return next ? next() : false;
    }
  }


  /**
   * 在redis中执行lua脚本
   * @param  content 脚本内容
   * @param  params [{key: 'test', value: 10}, {key: 'test', value: 10}]
   */
  async runLuaInRedis(script: string, params: Array<HpyerLuaParams> = null) {
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
      let redis = this.getRedis();
      let res = await redis.eval(args);
      return res;
    }
    catch (e) {
      this.log.error(`Fail to run lua script in redis.`, e);
    };
    return false;
  }

  /**
   * 执行系统命令
   * @param  {string} cmd 命令
   * @param  {array} args 参数，可选
   */
  runCmd = (cmd, args = []) => {
    return new Promise((resolve, reject) => {
      let logger = this.log;
      logger.info('Run command', cmd, args);
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
        logger.info('After run command', data);
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
  buildUniqueId(second: number, microSecond: number, machineId: number | string, count: number): string {
    let miliSecond = second * 1000 + microSecond - this.config.uniqueId.epoch;
    // 0 + 41位毫秒时间戳 + 8机器id + 14位自增序列
    let base = '0' + this.utils.pad(miliSecond.toString(2), 41, '0', true) + this.utils.pad(machineId.toString(2), 8, '0', true) + this.utils.pad(count.toString(2), 14, '0', true);
    var id_bit = new BN(base, 2);
    return id_bit.toString();
  };

  /**
   * 获取唯一id（雪花算法 Snowflake）
   * @param machineId 机器id，可理解为不同业务场景，2^8，可选值：0~255
   */
  async getUniqueId(machineId: number | string = 0): Promise<string> {
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

    let segments = await this.runLuaInRedis(luaScript, [
      { key: this.config.uniqueId.cacheKey, value: machineId.toString() }
    ]);
    // redis的毫秒是6位的，取前3位
    segments[1] = parseInt((segments[1] / 1000).toString());
    return this.buildUniqueId.call(this, segments);
  }

  /**
   * 从唯一id中解析出时间戳（雪花算法 Snowflake）
   * @param id id
   */
  parseUniqueId(id: string): object {
    let id_bit = new BN(id, 10);
    // 回填为64位
    let base = this.utils.pad(id_bit.toString(2), 64, '0', true);
    let timestamp = parseInt(base.substr(1, 41), 2) + this.config.uniqueId.epoch;
    let machineId = parseInt(base.substr(42, 8), 2);
    let count = parseInt(base.substr(50, 14), 2);
    return { timestamp, machineId, count };
  }

  /**
   * 启动服务
   * @param cfg 配置项
   */
  async start(cfg: HpyerServerConfig = null): Promise<void> {
    if (cfg) for (let k in cfg) {
      if (cfg[k] === null) continue;
      if (Utils.isObject(cfg[k])) {
        this.config[k] = Utils.extend({}, DefaultConfig[k], cfg[k]);
      }
      else if (Utils.isArray(cfg[k])) {
        this.config[k] = Utils.extend([], DefaultConfig[k], cfg[k]);
      }
      else {
        this.config[k] = cfg[k];
      }
    }

    if (!this.config.root.modules) {
      throw new Error('NOT set modules root');
    }
    if (!this.config.root.models) {
      throw new Error('NOT set models root');
    }
    if (!this.config.root.services) {
      throw new Error('NOT set services root');
    }
    if (!this.config.root.errors) {
      throw new Error('NOT set errors root');
    }
    this.config.root.modules = Utils.rtrim(this.config.root.modules, '\\/+') + '/';
    this.config.root.models = Utils.rtrim(this.config.root.models, '\\/+') + '/';
    this.config.root.services = Utils.rtrim(this.config.root.services, '\\/+') + '/';
    this.config.root.errors = Utils.rtrim(this.config.root.errors, '\\/+') + '/';

    // 系统请求处理方法
    let koaRouter = new KoaRouter;
    koaRouter.use(MiddlewareRequest);
    // 自定义路由
    if (this.config.koa.routers && Utils.isArray(this.config.koa.routers)) this.config.koa.routers.forEach(router => {
      if (router.path && Utils.isString(router.path)) {
        // 配置指定路由的中间件
        if (router.middleware && (Utils.isFunction(router.middleware) || Utils.isArray(router.middleware))) {
          koaRouter.use(router.path, router.middleware);
        }
        // 增加路由处理方法
        if (router.handler && Utils.isFunction(router.handler)) {
          router.method = router.method || 'all';
          koaRouter[router.method](router.path, router.handler);
        }
      }
    });
    // 系统路由
    koaRouter.all('/', this.KoaHandler());
    koaRouter.all('/:module/:controller/:action', this.KoaHandler());
    koaRouter.all('/:controller/:action', this.KoaHandler());

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
        this.ControllerHandler(module, controller, action).then(() => {
          process.exit(0);
        });
      }
      else {
        this.log.error('Router `' + argv2 + '` not found');
      }
    }
    else {
      this.server = new Koa();

      this.server.keys = [this.config.key];

      this.server.use(KoaBody(this.config.koa.body));

      this.server.use(KoaSession(this.config.koa.session, this.server));

      if (this.config.koa.statics && Utils.isArray(this.config.koa.statics)) this.config.koa.statics.forEach(path => {
        this.server.use(KoaStatic(Path.resolve(path)));
      });

      this.server.use(koaRouter.routes()).use(koaRouter.allowedMethods());

      // 404
      this.server.use(async (ctx: Koa.Context, next: Koa.Next) => {
        if (ctx.status === 404) {
          if (this.isAjax(ctx)) {
            ctx.type = 'application/json';
            ctx.body = this.utils.jsonError('Server Error', '500');
          }
          else {
            ctx.type = 'text/html';
            ctx.body = (new Templater(this)).renderError({
              success: false,
              message: 'Page not found.',
              code: 404,
              waitSecond: 0,
              jumpUrl: ''
            });
          }
        }
      });

      this.server.listen(this.config.port, () => {
        this.log.info('Current ENV: ' + this.config.env);
        this.log.info('Framework version: ' + this.version);
        this.log.info('Listen port: ' + this.config.port);
      });
    }

  }

};

export default Application;
