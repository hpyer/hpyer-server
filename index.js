'use strict';

const Helper = require('./lib/helper.js');
const Db = require('./lib/database');
const Cache = require('./lib/cache');

const NodeSchedule = require('node-schedule');
const ChildProcess = require('child_process');
const Path = require('path');
const Fs = require('fs');
const Os = require('os');

const Koa = require('koa');
const KoaBody = require('koa-body');
const KoaSession = require('koa-session');
const KoaStatic = require('koa-static');
const KoaRouter = require('koa-router')();

const Templater = require('./core/Templater');

/**
 * 是否ajax请求
 * @param  object  ctx  koa的上下文
 * @return boolean
 */
const isAjax = function (ctx) {
  let isAjax = false;
  if (ctx.request.isAjax || (ctx.request.header['x-requested-with'] && ctx.request.header['x-requested-with'] == 'XMLHttpRequest')) {
    isAjax = true;
  }
  return isAjax;
}

// 全局变量
global.Hpyer = Object.create(Helper);

/**
 * 是否生产环境
 * @var boolean
 */
Hpyer.version = require('./package.json').version;

/**
 * 是否生产环境
 * @var boolean
 */
Hpyer.isProduction = process.env.NODE_ENV == 'production';

/**
 * 输出日志信息
 * @param  [mixed]  ...args  参数，同console.log
 * @return void
 */
Hpyer.log = (...args) => {
  if (typeof args[0] != 'string') args[0] = JSON.stringify(args[0]);
  args[0] = `[${Hpyer.getFormatTime()}] [INFO] - ${args[0]}`;
  console.log.apply(null, args);
};

/**
 * 输出错误信息，控制台中会显示红色
 * @param  [mixed]  ...args  参数，同console.log
 * @return void
 */
Hpyer.error = (...args) => {
  if (typeof args[0] != 'string') args[0] = JSON.stringify(args[0]);
  args[0] = `[${Hpyer.getFormatTime()}] \x1B[31m[ERROR] - ${args[0]}\x1B[39m`;
  console.log.apply(null, args);
};

/**
 * 获取db实例对象
 * @param  string  provider  数据库驱动
 * @return object
 */
Hpyer.getDB = async (provider) => {
  if (!Hpyer.config.db.enable) return null;
  if (!provider) provider = Hpyer.config.db.provider;
  return await Db.getInstance(provider, Hpyer.config.db[provider]);
};
Hpyer.escape = Db.escape;
Hpyer.parseWhere = Db.parseWhere;

/**
 * 执行数据库事务
 * @param  function  callback  事务处理方法，该方法回传入db实例对象
 * @return boolean
 */
Hpyer.transaction = async (callback) => {
  let db = await Hpyer.getDB();
  if (!db) return false;
  let res = await db.transaction(callback);
  db.disconnect();
  return res;
};


let modelInstances = {};
/**
 * 获取model实例
 * @param  string  name  服务名称
 * @param  string  app  应用名称
 * @return object
 */
Hpyer.model = (name, app=null) => {
  try {
    let tag = name;
    if (app) tag = app + '-' + name;
    if (!modelInstances[tag]) {
      let modelClass;
      try {
        if (app) {
          modelClass = require(Hpyer.config.root.apps + '/' + app + '/' + Hpyer.config.root.defaultModelDir + '/' + name);
        }
        else {
          modelClass = require(Hpyer.config.root.models + name);
        }
      }
      catch (e) {
        modelClass = class extends Hpyer.Model{};
      }
      modelInstances[tag] = new (modelClass);
      if (!modelInstances[tag].table) {
        modelInstances[tag].table = Hpyer.toLineCase(name, '_');
      }
    }
    return modelInstances[tag];
  }
  catch (e) {
    Hpyer.error('Model `' + name + '` not found.', e);
    throw e;
  }
  return null;
};


let serviceInstances = {};
/**
 * 获取service实例
 * @param  string  name  服务名称
 * @return object
 */
Hpyer.service = (name) => {
  try {
    if (!serviceInstances[name]) {
      let path = Hpyer.config.root.services;
      serviceInstances[name] = new (require(path + name));
    }
    return serviceInstances[name];
  }
  catch (e) {
    Hpyer.error('Service `' + name + '` not found.', e);
    throw e;
  }
  return null;
};

/**
 * Koa的控制器处理方法
 * @param  object  ctx  koa的上下文
 * @param  function  next  koa的下一中间件
 * @return boolean
 */
Hpyer.KoaHandler = async (ctx, next) => {
  let app = ctx.params.app || Hpyer.config.defaultAppName;
  let controller = ctx.params.controller || Hpyer.config.defaultControllerName;
  let action = ctx.params.action || Hpyer.config.defaultActionName;

  return await Hpyer.ControllerHandler(app, controller, action, ctx, next);
};

/**
 * 控制器处理方法
 * @param  string  app  应用名称
 * @param  string  controller  控制器名称
 * @param  string  action  方法名称
 * @param  object  ctx  koa的上下文
 * @param  function  next  koa的下一中间件
 * @return boolean
 */
Hpyer.ControllerHandler = async (app, controller, action, ctx = null, next = null) => {
  app = app || Hpyer.config.defaultAppName;
  controller = controller || Hpyer.config.defaultControllerName;
  action = action || Hpyer.config.defaultActionName;
  let instance;
  try {
    let path = Path.resolve(Hpyer.config.root.apps + '/' + app + '/' + Hpyer.config.defaultControllerDir + '/') + '/';
    instance = new (require(path + controller));
  }
  catch (e) {
    Hpyer.error('Controller `' + controller + '` not found.', e);
    if (ctx) ctx.response.status = 404;
    return next ? next() : false;
  }
  if (!Hpyer.isFunction(instance[action + 'Action'])) {
    Hpyer.error('Action `' + action + '` not found.');
    if (ctx) ctx.response.status = 404;
    return next ? next() : false;
  }
  instance.app = app;
  instance.controller = controller;
  instance.action = action;
  instance.ctx = ctx;
  instance.isPost = ctx && ctx.request.method == 'POST';
  instance.isCli = !ctx && true;

  instance.isAjax = function () {
    return isAjax(ctx);
  }

  try {
    let res;
    if (Hpyer.isFunction(instance.__before)) {
      res = await instance.__before();
      if (false === res) return next ? next() : false;
    }

    await instance[action + 'Action']();

    if (Hpyer.isFunction(instance.__after)) {
      res = await instance.__after();
      if (false === res) return next ? next() : false;
    }
  }
  catch (e) {
    Hpyer.error('Action `' + action + '` occurred a fatal error.', e);

    ctx.status = 500;
    if (isAjax(ctx)) {
      ctx.type = 'application/json';
      ctx.body = Hpyer.jsonError('服务器错误', 500);
    }
    else {
      ctx.type = 'text/html';
      ctx.body = Templater.renderError({
        success: false,
        message: '服务器错误',
        code: 500,
        waitSecond: 0,
        jumpUrl: ''
      });
    }
    return next ? next() : false;
  }
};

/**
 * 获取模版操作对象
 * @return object
 */
Hpyer.getTemplater = () => {
  return Templater;
}

/**
 * 获取缓存操作实例
 * @param  string  provider  缓存驱动，可选
 * @return object
 */
Hpyer.getCacher = (provider=null) => {
  if (!Hpyer.config.cache.enable) return null;
  if (!provider) provider = Hpyer.config.cache.provider;
  return Cache.getInstance(provider, Hpyer.config.cache[provider]);
}

/**
 * 获取缓存值
 * @param  string  name   缓存名称
 * @param  string  provider   缓存驱动，可选
 * @return [mixed]
 */
Hpyer.getCache = async (name, provider=null) => {
  let cacher = Hpyer.getCacher(provider);
  if (!cacher) return null;
  return await cacher.fetch(name);
}

/**
 * 设置缓存
 * @param  string  name   缓存名称
 * @param  [mixed]  value   缓存值
 * @param  integer  expireIn   时效，过期秒数，单位：秒，可选
 * @param  string  provider   缓存驱动，可选
 * @return boolean
 */
Hpyer.setCache = async (name, value = null, expireIn = 0, provider=null) => {
  let cacher = Hpyer.getCacher(provider);
  if (!cacher) return false;
  return await cacher.save(name, value, expireIn);
}

/**
 * 删除缓存
 * @param  string  name   缓存名称
 * @param  string  provider   缓存驱动，可选
 * @return boolean
 */
Hpyer.removeCache = async (name, provider=null) => {
  let cacher = Hpyer.getCacher(provider);
  if (!cacher) return false;
  return await cacher.delete(name);
}

/**
 * 在redis中执行lua脚本
 * @param  string  file_name   脚本名称
 * @param  array  params [{key: 'test', value: 10}, {key: 'test', value: 10}]
 * @return boolean
 */
Hpyer.runLuaInRedis = async (file_name, params) => {
  try {
    let file = Path.resolve(__dirname + '/../lua/' + file_name + '.lua');
    let script = Fs.readFileSync(file);
    if (!script) throw new Error('NO lua script');
    let args = [script];
    if (params && params.length > 0) {
      let keys = [], values = [];
      for (let i in params) {
        keys.push(params[i].key);
        values.push(params[i].value);
      }
      args.push(params.length);
      args = args.concat(keys, values);
    }
    else {
      args.push(0);
    }
    let redis = Hpyer.getRedis();
    let res = await redis.evalAsync(...args);
    return res;
  }
  catch (e) {
    Hpyer.log('无法在Redis中执行lua脚本', e);
  };
  return false;
}

/**
 * 执行计划任务
 * @return void
 */
Hpyer.runCron = () => {
  if (!Hpyer.config.cron.enable) {
    Hpyer.log('Cron not enabled');
    return;
  }
  Hpyer.log('Cron is starting...');

  let crons = Hpyer.config.cron.jobs || [];
  let callback = function (cron) {
    let cmd = Path.resolve('./node_modules/.bin/cross-env');
    let args = ['NODE_ENV=' + Hpyer.config('env'), 'node', Path.resolve(Hpyer.config.entry), cron.path];
    Hpyer.log('Run cron', cmd, args);
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

    // let cmd = Path.resolve('./node_modules/.bin/cross-env') + ' NODE_ENV=' + Hpyer.config.env + ' node ' + Path.resolve(Hpyer.config.entry) + ' ' + cron.path;
    // Hpyer.log(cmd);
    // let job = ChildProcess.exec(cmd, (error, stdout, stderr) => {
    //   console.log(stdout);
    //   Hpyer.log('After run cron');
    // });
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
};

/**
 * 执行系统命令
 * @param  string  cmd   命令
 * @param  array  args   参数，可选
 * @return promise
 */
Hpyer.runCmd = (cmd, args = []) => {
  return new Promise((resolve, reject) => {
    Hpyer.log('Run command', cmd, args);
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
      console.log('After run command', data);
      if (error) {
        reject(error);
      }
      resolve(data);
    });

    // ChildProcess.exec(cmd, (error, stdout, stderr) => {
    //   if (error) {
    //     reject(errerror, stdout, stderror);
    //   }
    //   else {
    //     resolve(stdout);
    //   }
    // });
  });
};

/**
 * 框架启动方法
 * @param  object  cfg   配置项，可选
 * @return void
 */
Hpyer.start = async (cfg = null) => {
  const DefaultConfig = require('./DefaultConfig');
  Hpyer.config = Hpyer.merge(DefaultConfig, cfg || {});

  if (!Hpyer.config.root.apps) {
    throw new Error('NOT set app root');
  }
  if (!Hpyer.config.root.models) {
    throw new Error('NOT set model root');
  }
  if (!Hpyer.config.root.services) {
    throw new Error('NOT set service root');
  }
  if (!Hpyer.config.root.errors) {
    throw new Error('NOT set error root');
  }
  Hpyer.config.root.apps = Hpyer.rtrim(Hpyer.config.root.apps, '\\/+') + '/';
  Hpyer.config.root.models = Hpyer.rtrim(Hpyer.config.root.models, '\\/+') + '/';
  Hpyer.config.root.services = Hpyer.rtrim(Hpyer.config.root.services, '\\/+') + '/';
  Hpyer.config.root.errors = Hpyer.rtrim(Hpyer.config.root.errors, '\\/+') + '/';

  // 系统请求处理方法
  KoaRouter.use(require('./middlewares/request'));
  // 自定义路由
  if (Hpyer.config.koa.routers && Hpyer.isArray(Hpyer.config.koa.routers)) Hpyer.config.koa.routers.forEach(router => {
    if (router.path && Hpyer.isString(router.path)) {
      // 配置指定路由的中间件
      if (router.middleware && (Hpyer.isFunction(router.middleware) || Hpyer.isArray(router.middleware))) {
        KoaRouter.use(router.path, router.middleware);
      }
      // 增加路由处理方法
      if (router.handler && Hpyer.isFunction(router.handler)) {
        router.method = router.method || 'all';
        KoaRouter[router.method](router.path, router.handler);
      }
    }
  });
  // 系统路由
  KoaRouter.all('/', Hpyer.KoaHandler);
  KoaRouter.all('/:app/:controller/:action', Hpyer.KoaHandler);
  KoaRouter.all('/:controller/:action', Hpyer.KoaHandler);

  Hpyer.Controller = require('./core/Controller');
  Hpyer.Model = require('./core/Model');
  Hpyer.Service = require('./core/Service');

  let argv2 = process.argv[2];
  if (argv2 && /^\/?[a-z]\w*/i.test(argv2)) {
    let matched = KoaRouter.match(argv2, 'GET');
    if (matched.path.length > 0) {
      matched = Hpyer.matchAll(/\/([^\/]*)/gi, argv2);
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
      Hpyer.ControllerHandler(app, controller, action).then(() => {
        process.exit(0);
      });
    }
    else {
      Hpyer.error('Router `' + argv2 + '` not found');
    }
  }
  else {
    Hpyer.app = new Koa();

    Hpyer.app.keys = [Hpyer.config.key];

    Hpyer.app.use(KoaBody(Hpyer.config.koa.body));

    Hpyer.app.use(KoaSession(Hpyer.config.koa.session, Hpyer.app));

    if (Hpyer.config.koa.statics && Hpyer.isArray(Hpyer.config.koa.statics)) Hpyer.config.koa.statics.forEach(path => {
      Hpyer.app.use(KoaStatic(Path.resolve(path)));
    });

    Hpyer.app.use(KoaRouter.routes()).use(KoaRouter.allowedMethods());

    // 404
    Hpyer.app.use(async function (ctx, next) {
      if (parseInt(ctx.status) === 404) {
        if (isAjax(ctx)) {
          ctx.type = 'application/json';
          ctx.body = Hpyer.jsonError('服务器错误', 500);
        }
        else {
          ctx.type = 'text/html';
          ctx.body = Templater.renderError({
            success: false,
            message: '页面未找到',
            code: 404,
            waitSecond: 0,
            jumpUrl: ''
          });
        }
      }
    });

    // 如果未配置入口文件，则尝试提取
    if (!Hpyer.config.entry) {
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
              Hpyer.config.entry = res[1];
            }
            break;
          }
        }
      }
      if (!Hpyer.config.entry) {
        Hpyer.error('Can not detect entry file, please set `entry` in configration');
        return;
      }
    }

    Hpyer.app.listen(Hpyer.config.port, () => {
      Hpyer.log('Current ENV: ' + Hpyer.config.env);
      Hpyer.log('Framework version: ' + Hpyer.version);
      Hpyer.log('Listen port: ' + Hpyer.config.port);

      if (Hpyer.config.cron.enable) {
        Hpyer.runCron();
      }
    });
    //
    // return Hpyer.app;
  }

}
