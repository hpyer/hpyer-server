'use strict';

import { HashMap, HpyerConfig, HpyerLuaParams, HpyerModelMap, HpyerServiceMap, HpyerDbProvider, HpyerCacheProvider } from '../Support/Types/Hpyer';

import Fs from 'fs';
import Path from 'path';
import Axios from 'axios';
import LogLevel from 'loglevel';
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

import IORedis from 'ioredis';
import NodeSchedule from 'node-schedule';
import ChildProcess from 'child_process';


let modelInstances: HpyerModelMap = {};
let serviceInstances: HpyerServiceMap = {};

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
  config: HpyerConfig = DefaultConfig;

  /**
   * koa实例
   */
  server: Koa = null;

  /**
   * 是否ajax请求
   * @param  {object}  ctx  koa的上下文
   * @return {boolean}
   */
  isAjax (ctx: Koa.Context) {
    let isAjax = false;
    if (ctx.isAjax || (ctx.request.header['x-requested-with'] && ctx.request.header['x-requested-with'] == 'XMLHttpRequest')) {
      isAjax = true;
    }
    return isAjax;
  };

  doRequest (payload: HashMap, returnResponse: boolean = false): Promise<any> {
    let start_time = (new Date).getTime();
    this.log.info(`doRequest_${start_time}`, payload);

    return Axios.request(payload).then(res => {
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
      this.log.error(`doRequest.error_${start_time}`, `${end_time - start_time}ms`, err);
    });

  }

  /**
   * 获取数据库操作实例
   * @param {string} provider 数据库供应商
   * @return {object}
   */
  getDB(provider: HpyerDbProvider = null): Promise<ContractSql> {
    if (!this.config.db.enable) return null;
    if (!provider) provider = this.config.db.provider;

    let fetcher = require('../Support/Database/Providers/Provider' + Utils.toCamelCase(provider));
    return fetcher(this.config.db[provider]);
  }

  /**
   * 获取redis操作实例
   * @param  options 缓存驱动，可选
   */
  getRedis(options: IORedis.RedisOptions = null): IORedis.Redis {
    if (!options) {
      options = this.config.cache['redis'];
    }
    if (!this.config.cache.enable) return null;
    try {
      return IORedis(options);
    }
    catch (e) {
      this.log.error(`Fail to create Redis client.`, e);
    }
    return null;
  }

  /**
   * 获取缓存操作实例
   * @param  {string} provider 缓存驱动，可选
   * @return {object}
   */
  getCacher(provider: HpyerCacheProvider = null): ContractCache {
    if (!this.config.cache.enable) return null;
    if (!provider) provider = this.config.cache.provider;
    let fetcher = require('../Support/Database/Providers/Provider' + Utils.toCamelCase(provider));
    return fetcher(this.config.cache[provider]);
  }

  /**
   * 判断缓存是否存在
   * @param  {string} name 缓存名称
   * @param  {string} provider 缓存驱动，可选
   * @return {boolean}
   */
  async hasCache(name: string, provider: HpyerCacheProvider = null): Promise<boolean> {
    let cacher: ContractCache = this.getCacher(provider);
    if (!cacher) return null;
    return cacher.has(name);
  }

  /**
   * 获取缓存值
   * @param  {string} name 缓存名称
   * @param  {string} provider 缓存驱动，可选
   * @return {any}
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
   * @param  {string} provider 缓存驱动，可选
   * @return {boolean}
   */
  async setCache(name: string, value: any = null, expireIn: number = 0, provider: HpyerCacheProvider = null): Promise<boolean> {
    let cacher: ContractCache = this.getCacher(provider);
    if (!cacher) return false;
    return cacher.set(name, value, expireIn);
  }

  /**
   * 删除缓存
   * @param  {string} name 缓存名称
   * @param  {string} provider 缓存驱动，可选
   * @return {boolean}
   */
  async removeCache(name: string, provider: HpyerCacheProvider = null): Promise<boolean> {
    let cacher: ContractCache = this.getCacher(provider);
    if (!cacher) return false;
    return cacher.del(name);
  }

  /**
   * 在redis中执行lua脚本
   * @param  {string} file_name 脚本名称（含扩展名）
   * @param  {array} params [{key: 'test', value: 10}, {key: 'test', value: 10}]
   * @return {boolean}
   */
  async runLuaInRedis(file_name: string, params: Array<HpyerLuaParams>) {
    try {
      let path = Utils.rtrim(this.config.root.luas, '\\/+') + '/';
      let file = Path.resolve(path + file_name);
      let script = Fs.readFileSync(file).toString();
      if (!script) throw new Error('NO lua script');
      let args: Array<string | number | Buffer> = [script];
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
   * 获取model实例
   * @param  {string} name 服务名称
   * @param  {string} module 模块名称
   * @return {object}
   */
  model(name: string, module: string = null) {
    try {
      let tag = name;
      if (module) tag = module + '-' + name;
      if (!modelInstances[tag]) {
        let modelClass;
        try {
          if (module) {
            modelClass = require(this.config.root.modules + '/' + module + '/' + this.config.defaultModelDir + '/' + name);
          }
          else {
            modelClass = require(this.config.root.models + name);
          }
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
   * @return {object}
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
   * @param  ctx koa的上下文
   * @param  next koa的下一中间件
   */
  KoaHandler(ctx: Koa.Context, next: Koa.Next): Promise<Koa.Next> {
    let module = ctx.params.module || this.config.defaultModuleName;
    let controller = ctx.params.controller || this.config.defaultControllerName;
    let action = ctx.params.action || this.config.defaultActionName;

    return this.ControllerHandler(module, controller, action, ctx, next);
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

      if (!Utils.isFunction(instance[action])) {
        throw new Error('Action not exists.');
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
   * 执行计划任务
   * @return {void}
   */
  runCron () {
    if (!this.config.cron.enable) {
      this.log.info('Cron not enabled');
      return;
    }
    this.log.info('Cron is starting...');

    let crons = this.config.cron.jobs || [];
    let callback = function (cron) {
      let cmd = Path.resolve('./node_modules/.bin/cross-env');
      let args = ['NODE_ENV=' + this.config.env, 'node', Path.resolve(this.config.entry), cron.path];
      this.log.info('Run cron', cmd, args);
      let job = ChildProcess.spawn(cmd, args);
      // let data_buffers = [];
      let error_buffers = [];
      job.stdout.on('data', function (data) {
        // data_buffers.push(data);
        console.log(data.toString());
      });
      job.stderr.on('data', function (data) {
        error_buffers.push(data);
      });
      job.on('exit', function (code) {
        console.log('After run cron', cmd, args, code);
      });

    };
    crons.map((cron, i) => {
      if (!cron.enable) return true;
      NodeSchedule.scheduleJob(cron.time, function () {
        callback(cron);
      });
      if (cron.immediate) {
        callback(cron);
      }
    });
  }

  async start (cfg: HpyerConfig = null): Promise<void> {
    this.config = Utils.extend({}, DefaultConfig, cfg) as HpyerConfig;

    if (!this.config.root.modules) {
      throw new Error('NOT set module root');
    }
    if (!this.config.root.models) {
      throw new Error('NOT set model root');
    }
    if (!this.config.root.services) {
      throw new Error('NOT set service root');
    }
    if (!this.config.root.errors) {
      throw new Error('NOT set error root');
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
    koaRouter.all('/', this.KoaHandler);
    koaRouter.all('/:app/:controller/:action', this.KoaHandler);
    koaRouter.all('/:controller/:action', this.KoaHandler);

    let argv2 = process.argv[2];
    if (argv2 && /^\/?[a-z]\w*/i.test(argv2)) {
      let matched = koaRouter.match(argv2, 'GET');
      if (matched.path.length > 0) {
        matched = Utils.matchAll(/\/([^\/]*)/gi, argv2);
        let app = '', controller = '', action = '';
        if (matched.length > 2) {
          app = matched[0][1];
          controller = matched[1][1];
          action = matched[2][1];
        }
        else {
          controller = matched[0][1];
          action = matched[1][1];
        }
        this.ControllerHandler(app, controller, action).then(() => {
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
      this.server.use(async function (ctx, next) {
        if (ctx.status === 404) {
          if (this.isAjax(ctx)) {
            ctx.type = 'application/json';
            ctx.body = this.jsonError('Server Error', 500);
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

      // 如果未配置入口文件，则尝试提取
      if (!this.config.entry) {
        try {
          throw new Error('');
        }
        catch (err) {
          const stack = err.stack;
          const stackArr = stack.split('\n');
          for (let i = 0; i < stackArr.length; i++) {
            if (stackArr[i].indexOf('Object.<anonymous>') > 0 && i + 1 < stackArr.length) {
              let res = stackArr[i].match(/\(([^\:]*)\:/);
              if (res && res[1]) {
                this.config.entry = res[1];
              }
              break;
            }
          }
        }
        if (!this.config.entry) {
          this.log.error('Can not detect entry file, please set `entry` in configration');
          return;
        }
      }

      this.server.listen(this.config.port, () => {
        this.log.info('Current ENV: ' + this.config.env);
        this.log.info('Framework version: ' + this.version);
        this.log.info('Listen port: ' + this.config.port);

        if (this.config.cron.enable) {
          this.runCron();
        }
      });
    }

  }

};

export default Application;
