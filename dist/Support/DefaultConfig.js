'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Hpyer_1 = require("./Types/Hpyer");
const path_1 = __importDefault(require("path"));
const DefaultConfig = {
    // 当前启动脚本（即启动服务的脚本），仅影响计划任务的执行。未配置时，系统会尝试自动获取，建议配置为：__filename
    entry: '',
    // 服务端口
    port: '8001',
    // 加密密钥
    key: 'HpyerServer',
    // 运行环境，可自定义。如：development / test / production
    env: Hpyer_1.HpyerApplicationEnv.DEVELOPMENT,
    // app 私有 model 的目录名
    defaultModelDir: 'models',
    // app 私有 controller 的目录名
    defaultControllerDir: 'controllers',
    // app 私有 view 的目录名
    defaultViewDir: 'views',
    // 默认 module 名
    defaultModuleName: 'home',
    // 默认 controller 名
    defaultControllerName: 'index',
    // 默认 action 名
    defaultActionName: 'index',
    // 各主要目录
    root: {
        // app 所在目录
        modules: './modules/',
        // 公用 model 所在目录
        models: './models/',
        // 公用 service 所在目录
        services: './services/',
        // 错误页面所在目录
        errors: path_1.default.resolve(__dirname + '/Errors/') + '/',
        // lua脚本所在目录
        luas: './luas/',
    },
    // redis 唯一id相关配置
    uniqueId: {
        // redis 的hash键名
        cacheKey: 'HpyerUniqueId',
        // 世纪，用于减少生成的id数字大小，单位：毫秒，如：1300000000000
        epoch: 0,
    },
    // koa 相关配置
    koa: {
        // koa-body 相关配置，详见：https://www.npmjs.com/package/koa-body
        body: {
            includeUnparsed: false,
            multipart: true,
            jsonLimit: '10mb',
            formLimit: '20mb',
            textLimit: '20mb',
            xmlLimit: '20mb',
        },
        // koa-session 相关配置，详见：https://www.npmjs.com/package/koa-session
        session: {
            key: 'KOA_SESSION:HpyerServer',
            /** (number || 'session') maxAge in ms (default is 1 days) */
            /** 'session' will result in a cookie that expires when session/browser is closed */
            /** Warning: If a session cookie is stolen, this cookie will never expire */
            maxAge: 86400000,
            overwrite: true,
            httpOnly: true,
            signed: true,
            rolling: false,
            renew: false,
        },
        // 需要加载的静态资源目录，路径数组
        statics: [
            '/public/',
        ],
        // 自定义路由
        routers: [],
    },
    // 数据库相关配置
    db: {
        // 是否启用
        enable: false,
        // 数据库驱动
        provider: Hpyer_1.HpyerDbProvider.MYSQL,
        // mysql 相关配置，详见：https://www.npmjs.com/package/mysql
        mysql: {
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'test',
            charset: 'utf8mb4_unicode_ci'
        },
    },
    // 数据库相关配置
    cache: {
        // 是否启用
        enable: false,
        // 缓存驱动，目前支持：'file', 'redis'
        provider: Hpyer_1.HpyerCacheProvider.FILE,
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
    // 模版相关选项
    template: {
        provider: Hpyer_1.HpyerTemplateProvider.NUNJUCKS,
        // 默认的错误页面模版
        defaultMessageTpl: 'message.njk',
        // 模版文件扩展名
        tplExtention: '.njk',
        // nunjucks 选项，详见：https://mozilla.github.io/nunjucks/
        nunjucks: {
            autoescape: true,
            tags: {
                blockStart: '{%',
                blockEnd: '%}',
                variableStart: '{{',
                variableEnd: '}}',
                commentStart: '{#',
                commentEnd: '#}'
            }
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
exports.default = DefaultConfig;
