'use strict';
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const axios_1 = __importDefault(require("axios"));
const loglevel_1 = __importDefault(require("loglevel"));
const Utils = __importStar(require("../Support/Utils"));
const DefaultConfig_1 = __importDefault(require("../Support/DefaultConfig"));
const Model_1 = __importDefault(require("./Model"));
const Templater_1 = __importDefault(require("./Templater"));
const Request_1 = __importDefault(require("../Support/Middlewares/Request"));
const koa_1 = __importDefault(require("koa"));
const KoaBody_1 = __importDefault(require("../Support/KoaBody"));
const koa_session_1 = __importDefault(require("koa-session"));
const koa_static_1 = __importDefault(require("koa-static"));
const koa_router_1 = __importDefault(require("koa-router"));
const ioredis_1 = __importDefault(require("ioredis"));
const node_schedule_1 = __importDefault(require("node-schedule"));
const child_process_1 = __importDefault(require("child_process"));
let modelInstances = {};
let serviceInstances = {};
class Application {
    constructor() {
        /**
         * 版本号
         */
        this.version = require('../../package.json').version;
        /**
         * 是否生产环境
         */
        this.isProduction = process.env.NODE_ENV == 'production';
        /**
         * 记录日志
         */
        this.log = loglevel_1.default;
        /**
         * 常用工具
         */
        this.utils = Utils;
        /**
         * 配置项
         */
        this.config = DefaultConfig_1.default;
        /**
         * koa实例
         */
        this.server = null;
    }
    /**
     * 是否ajax请求
     * @param  {object}  ctx  koa的上下文
     * @return {boolean}
     */
    isAjax(ctx) {
        let isAjax = false;
        if (ctx.isAjax || (ctx.request.header['x-requested-with'] && ctx.request.header['x-requested-with'] == 'XMLHttpRequest')) {
            isAjax = true;
        }
        return isAjax;
    }
    ;
    doRequest(payload, returnResponse = false) {
        let start_time = (new Date).getTime();
        this.log.info(`doRequest_${start_time}`, payload);
        return axios_1.default.request(payload).then(res => {
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
    getDB(provider = null) {
        if (!this.config.db.enable)
            return null;
        if (!provider)
            provider = this.config.db.provider;
        let fetcher = require('../Support/Database/Providers/Provider' + Utils.toCamelCase(provider));
        return fetcher(this.config.db[provider]);
    }
    /**
     * 获取redis操作实例
     * @param  options 缓存驱动，可选
     */
    getRedis(options = null) {
        if (!options) {
            options = this.config.cache['redis'];
        }
        if (!this.config.cache.enable)
            return null;
        try {
            return ioredis_1.default(options);
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
    getCacher(provider = null) {
        if (!this.config.cache.enable)
            return null;
        if (!provider)
            provider = this.config.cache.provider;
        let fetcher = require('../Support/Database/Providers/Provider' + Utils.toCamelCase(provider));
        return fetcher(this.config.cache[provider]);
    }
    /**
     * 判断缓存是否存在
     * @param  {string} name 缓存名称
     * @param  {string} provider 缓存驱动，可选
     * @return {boolean}
     */
    hasCache(name, provider = null) {
        return __awaiter(this, void 0, void 0, function* () {
            let cacher = this.getCacher(provider);
            if (!cacher)
                return null;
            return cacher.has(name);
        });
    }
    /**
     * 获取缓存值
     * @param  {string} name 缓存名称
     * @param  {string} provider 缓存驱动，可选
     * @return {any}
     */
    getCache(name, provider = null) {
        return __awaiter(this, void 0, void 0, function* () {
            let cacher = this.getCacher(provider);
            if (!cacher)
                return null;
            return cacher.get(name);
        });
    }
    /**
     * 设置缓存
     * @param  {string} name 缓存名称
     * @param  {any} value 缓存值
     * @param  {integer} expireIn 时效，过期秒数，单位：秒，可选
     * @param  {string} provider 缓存驱动，可选
     * @return {boolean}
     */
    setCache(name, value = null, expireIn = 0, provider = null) {
        return __awaiter(this, void 0, void 0, function* () {
            let cacher = this.getCacher(provider);
            if (!cacher)
                return false;
            return cacher.set(name, value, expireIn);
        });
    }
    /**
     * 删除缓存
     * @param  {string} name 缓存名称
     * @param  {string} provider 缓存驱动，可选
     * @return {boolean}
     */
    removeCache(name, provider = null) {
        return __awaiter(this, void 0, void 0, function* () {
            let cacher = this.getCacher(provider);
            if (!cacher)
                return false;
            return cacher.del(name);
        });
    }
    /**
     * 在redis中执行lua脚本
     * @param  {string} file_name 脚本名称（含扩展名）
     * @param  {array} params [{key: 'test', value: 10}, {key: 'test', value: 10}]
     * @return {boolean}
     */
    runLuaInRedis(file_name, params) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let path = Utils.rtrim(this.config.root.luas, '\\/+') + '/';
                let file = path_1.default.resolve(path + file_name);
                let script = fs_1.default.readFileSync(file).toString();
                if (!script)
                    throw new Error('NO lua script');
                let args = [script];
                if (params && params.length > 0) {
                    let keys = [], values = [];
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
                let res = yield redis.eval(args);
                return res;
            }
            catch (e) {
                this.log.error(`Fail to run lua script in redis.`, e);
            }
            ;
            return false;
        });
    }
    /**
     * 获取model实例
     * @param  {string} name 服务名称
     * @param  {string} module 模块名称
     * @return {object}
     */
    model(name, module = null) {
        try {
            let tag = name;
            if (module)
                tag = module + '-' + name;
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
                    modelClass = class extends Model_1.default {
                    };
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
    }
    ;
    /**
     * 获取service实例
     * @param  {string} name 服务名称
     * @return {object}
     */
    service(name) {
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
    }
    ;
    /**
     * Koa的控制器处理方法
     * @param  ctx koa的上下文
     * @param  next koa的下一中间件
     */
    KoaHandler(ctx, next) {
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
    ControllerHandler(module, controller, action, ctx = null, next = null) {
        return __awaiter(this, void 0, void 0, function* () {
            module = module || this.config.defaultModuleName;
            controller = controller || this.config.defaultControllerName;
            action = action || this.config.defaultActionName;
            let instance;
            try {
                let path = path_1.default.resolve(this.config.root.modules + '/' + module + '/' + this.config.defaultControllerDir + '/') + '/';
                instance = new (require(path + controller));
            }
            catch (e) {
                this.log.error('Controller `' + controller + '` not found.', e);
                if (ctx)
                    ctx.response.status = 404;
                return next ? next() : false;
            }
            if (!Utils.isFunction(instance[action + 'Action'])) {
                this.log.error('Action `' + action + '` not found.');
                if (ctx)
                    ctx.response.status = 404;
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
                    res = yield instance.__before();
                    if (false === res)
                        return next ? next() : false;
                }
                if (!Utils.isFunction(instance[action])) {
                    throw new Error('Action not exists.');
                }
                yield instance[action + 'Action']();
                if (Utils.isFunction(instance.__after)) {
                    res = yield instance.__after();
                    if (false === res)
                        return next ? next() : false;
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
                    ctx.body = (new Templater_1.default(this)).renderError({
                        success: false,
                        message: 'Server Error',
                        code: '500',
                        waitSecond: 0,
                        jumpUrl: ''
                    });
                }
                return next ? next() : false;
            }
        });
    }
    /**
     * 执行计划任务
     * @return {void}
     */
    runCron() {
        if (!this.config.cron.enable) {
            this.log.info('Cron not enabled');
            return;
        }
        this.log.info('Cron is starting...');
        let crons = this.config.cron.jobs || [];
        let callback = function (cron) {
            let cmd = path_1.default.resolve('./node_modules/.bin/cross-env');
            let args = ['NODE_ENV=' + this.config.env, 'node', path_1.default.resolve(this.config.entry), cron.path];
            this.log.info('Run cron', cmd, args);
            let job = child_process_1.default.spawn(cmd, args);
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
            if (!cron.enable)
                return true;
            node_schedule_1.default.scheduleJob(cron.time, function () {
                callback(cron);
            });
            if (cron.immediate) {
                callback(cron);
            }
        });
    }
    start(cfg = null) {
        return __awaiter(this, void 0, void 0, function* () {
            this.config = Utils.extend({}, DefaultConfig_1.default, cfg);
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
            let koaRouter = new koa_router_1.default;
            koaRouter.use(Request_1.default);
            // 自定义路由
            if (this.config.koa.routers && Utils.isArray(this.config.koa.routers))
                this.config.koa.routers.forEach(router => {
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
                this.server = new koa_1.default();
                this.server.keys = [this.config.key];
                this.server.use(KoaBody_1.default(this.config.koa.body));
                this.server.use(koa_session_1.default(this.config.koa.session, this.server));
                if (this.config.koa.statics && Utils.isArray(this.config.koa.statics))
                    this.config.koa.statics.forEach(path => {
                        this.server.use(koa_static_1.default(path_1.default.resolve(path)));
                    });
                this.server.use(koaRouter.routes()).use(koaRouter.allowedMethods());
                // 404
                this.server.use(function (ctx, next) {
                    return __awaiter(this, void 0, void 0, function* () {
                        if (ctx.status === 404) {
                            if (this.isAjax(ctx)) {
                                ctx.type = 'application/json';
                                ctx.body = this.jsonError('Server Error', 500);
                            }
                            else {
                                ctx.type = 'text/html';
                                ctx.body = (new Templater_1.default(this)).renderError({
                                    success: false,
                                    message: 'Page not found.',
                                    code: 404,
                                    waitSecond: 0,
                                    jumpUrl: ''
                                });
                            }
                        }
                    });
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
        });
    }
}
;
exports.default = Application;
