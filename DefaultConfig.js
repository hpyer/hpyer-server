'use strict';

const Path = require('path');

module.exports = {
  // 当前启动脚本（即启动服务的脚本），仅影响计划任务的执行。未配置时，系统会尝试自动获取，建议配置为：__filename
  entry: '',
  // 服务端口
  port: '8001',
  // 加密密钥
  key: 'HpyerServer',
  // 运行环境，可自定义。如：develop / test / production
  env: 'develop',

  // app 私有 model 的目录名
  defaultModelDir: 'models',
  // app 私有 controller 的目录名
  defaultControllerDir: 'controllers',
  // app 私有 view 的目录名
  defaultViewDir: 'views',
  // 默认 app 名
  defaultAppName: 'home',
  // 默认 controller 名
  defaultControllerName: 'index',
  // 默认 action 名
  defaultActionName: 'index',

  // 各主要目录
  root: {
    // app 所在目录
    apps: './apps/',
    // 公用 model 所在目录
    models: './models/',
    // 公用 service 所在目录
    services: './services/',
    // 错误页面所在目录
    errors: Path.resolve(__dirname + '/errors/') + '/',
  },

  // koa 相关配置
  koa: {
    // koa-body 相关配置，详见：https://www.npmjs.com/package/koa-body
    body: {
      multipart: true,
      jsonLimit: '10mb',
      formLimit: '20mb',
      textLimit: '20mb',
    },
    // koa-session 相关配置，详见：https://www.npmjs.com/package/koa-session
    session: {
      key: 'KOA_SESSION:HpyerServer', /** (string) cookie key (default is koa:sess) */
      /** (number || 'session') maxAge in ms (default is 1 days) */
      /** 'session' will result in a cookie that expires when session/browser is closed */
      /** Warning: If a session cookie is stolen, this cookie will never expire */
      maxAge: 86400000,
      overwrite: true, /** (boolean) can overwrite or not (default true) */
      httpOnly: true, /** (boolean) httpOnly or not (default true) */
      signed: true, /** (boolean) signed or not (default true) */
      rolling: false, /** (boolean) Force a session identifier cookie to be set on every response. The expiration is reset to the original maxAge, resetting the expiration countdown. (default is false) */
      renew: false, /** (boolean) renew session when session is nearly expired, so we can always keep user logged in. (default is false)*/
    },
    // 需要加载的静态资源目录，路径数组
    statics: [

    ]
  },

  // 数据库相关配置
  db: {
    // 是否启用
    enable: false,
    // 数据库驱动
    provider: 'mysql',

    // mysql 相关配置，详见：https://www.npmjs.com/package/mysql
    mysql: {
      host     : 'localhost',
      user     : 'root',
      password : '',
      database : 'test',
      charset  : 'utf8mb4_unicode_ci'
    },
  },

  // 数据库相关配置
  cache: {
    // 是否启用
    enable: false,
    // 缓存驱动，目前支持：'file', 'redis'
    provider: 'file',

    // 文件缓存的选项
    file: {
      // 文件存储位置
      path: './runtime/cache/',
      // 目录权限
      dirMode: 0o777,
      // 文件权限
      fileMode: 0o666,
      // 文件扩展名
      ext: '.cache'
    },

    // redis缓存选项，详见: https://www.npmjs.com/package/redis#options-object-properties
    redis: {
      host: 'localhost',
      port: 6379
    }
  },

  // nunjucks 模版相关选项，详见：https://mozilla.github.io/nunjucks/
  template: {
    // 默认的错误页面模版
    defaultMessageTpl: 'message.html',
    autoescape: true,
    tags: { // 修改定界符相关的参数
      blockStart: '{%',
      blockEnd: '%}',
      variableStart: '{{',
      variableEnd: '}}',
      commentStart: '{#',
      commentEnd: '#}'
    }
  },

  // 计划任务选项
  cron: {
    // 是否启用
    enable: false,
    // 任务列表
    jobs: [
      {
        // 定时时间，同 linux 的 cronjob
        time: '*/2 * * * *',
        // 要执行的任务的路由地址
        path: '/console/test',
        // 是否在服务启动时立即执行
        immediate: false,
        // 任务是否有效
        enable: false
      }
    ]
  },
};
