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
const path_1 = __importDefault(require("path"));
const child_process_1 = __importDefault(require("child_process"));
const Utils = __importStar(require("../Support/Utils"));
const DefaultConfig_1 = __importDefault(require("../Support/DefaultConfig"));
const Model_1 = __importDefault(require("./Model"));
const Middleware_1 = __importDefault(require("./Middleware"));
const Templater_1 = __importDefault(require("./Templater"));
const Request_1 = __importDefault(require("../Support/Middlewares/Request"));
const koa_1 = __importDefault(require("koa"));
const KoaBody_1 = __importDefault(require("../Support/KoaBody"));
const koa_session_1 = __importDefault(require("koa-session"));
const koa_static_1 = __importDefault(require("koa-static"));
const koa_router_1 = __importDefault(require("koa-router"));
const Logger_1 = __importDefault(require("../Support/Logger"));
const ioredis_1 = __importDefault(require("ioredis"));
const bn_js_1 = __importDefault(require("bn.js"));
let modelInstances = {};
let serviceInstances = {};
/**
 * 框架
 */
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
        this.log = Logger_1.default;
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
        /**
         * 执行系统命令
         * @param  {string} cmd 命令
         * @param  {array} args 参数，可选
         */
        this.runCmd = (cmd, args = []) => {
            return new Promise((resolve, reject) => {
                Logger_1.default.info('Run command', cmd, args);
                let job = child_process_1.default.spawn(cmd, args);
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
                    Logger_1.default.info('After run command', data);
                    if (error) {
                        reject(error);
                    }
                    resolve(data);
                });
            });
        };
        if (this.isProduction) {
            this.log.setLevel(this.log.levels.INFO);
        }
        else {
            this.log.setLevel(this.log.levels.DEBUG);
        }
    }
    /**
     * 获取模版操作实例
     * @param provider 模版供应商
     */
    getTemplater(provider = null) {
        return new Templater_1.default(this, provider);
    }
    /**
     * 获取数据库操作实例
     * @param {string} provider 数据库供应商
     */
    getDB(provider = null) {
        if (!this.config.db.enable)
            return null;
        if (!provider)
            provider = this.config.db.provider;
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
    transaction(closure, provider = null) {
        return __awaiter(this, void 0, void 0, function* () {
            let db = this.getDB(provider);
            if (!db)
                return false;
            let res = yield db.transaction(closure);
            db.disconnect();
            return res;
        });
    }
    /**
     * 获取redis操作实例
     * @param  options redis选项，详见: https://github.com/luin/ioredis/blob/HEAD/API.md#new_Redis_new
     */
    getRedis(options = null) {
        if (!options) {
            options = this.config.cache['redis'];
        }
        if (!this.config.cache.enable)
            return null;
        try {
            return new ioredis_1.default(options);
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
    getCacher(provider = null) {
        if (!this.config.cache.enable)
            return null;
        if (!provider)
            provider = this.config.cache.provider;
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
     * @param  {string} provider 缓存驱动，可选值：file, redis
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
     * @param  {string} provider 缓存驱动，可选值：file, redis
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
     * @param  {string} provider 缓存驱动，可选值：file, redis
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
     * 获取model实例
     * @param  {string} name 服务名称
     * @param  {string} module 模块名称
     */
    model(name, module = null) {
        try {
            let tag = name;
            if (module)
                tag = module + '-' + name;
            if (!modelInstances[tag]) {
                let modelClass;
                try {
                    let path = this.config.root.models;
                    if (module) {
                        path = this.config.root.modules + '/' + module + '/' + this.config.defaultModelDir + '/';
                    }
                    this.log.debug('model', path + name);
                    modelClass = require(path + name);
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
                modelInstances[name].$app = this;
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
     */
    service(name) {
        try {
            if (!serviceInstances[name]) {
                let path = this.config.root.services;
                serviceInstances[name] = new (require(path + name));
                // 注入相关实例、变量等
                serviceInstances[name].$app = this;
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
     */
    KoaHandler(ctx, next) {
        let module = ctx.params.module || ctx.$app.config.defaultModuleName;
        let controller = ctx.params.controller || ctx.$app.config.defaultControllerName;
        let action = ctx.params.action || ctx.$app.config.defaultActionName;
        return ctx.$app.ControllerHandler(module, controller, action, ctx, next);
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
                this.log.debug('controller', path + controller);
                instance = new (require(path + controller));
            }
            catch (e) {
                this.log.error('Controller `' + controller + '` not found.', e);
                if (ctx)
                    ctx.response.status = 404;
                return next ? yield next() : false;
            }
            if (!Utils.isFunction(instance[action + 'Action'])) {
                this.log.error('Action `' + action + '` not found.');
                if (ctx)
                    ctx.response.status = 404;
                return next ? yield next() : false;
            }
            // 注入相关实例、变量等
            instance.$app = this;
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
                        return next ? yield next() : false;
                }
                yield instance[action + 'Action']();
                if (Utils.isFunction(instance.__after)) {
                    res = yield instance.__after();
                    if (false === res)
                        return next ? yield next() : false;
                }
            }
            catch (e) {
                this.log.error('Action `' + action + '` occurred a fatal error.', e);
                ctx.status = 500;
                if (Utils.isAjaxRequest(ctx)) {
                    ctx.type = 'application/json';
                    ctx.body = Utils.jsonError('Server Error', '500');
                }
                else {
                    ctx.type = 'text/html';
                    ctx.body = this.getTemplater().renderError({
                        success: false,
                        message: 'Server Error',
                        code: '500',
                        waitSecond: 0,
                        jumpUrl: ''
                    });
                }
                return next ? yield next() : false;
            }
        });
    }
    /**
     * 在redis中执行lua脚本
     * @param  content 脚本内容
     * @param  params [{key: 'test', value: 10}, {key: 'test', value: 10}]
     */
    runLuaInRedis(script, params = null) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
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
     * 生成唯一id（雪花算法 Snowflake）
     * @param second 秒数，13位
     * @param microSecond 毫秒数，3位
     * @param machineId 机器id，可理解为不同业务场景，2^8，可选值：0~255
     * @param count 计数，2^14，可选值：0~16383
     */
    buildUniqueId(second, microSecond, machineId, count) {
        let miliSecond = second * 1000 + microSecond - this.config.uniqueId.epoch;
        // 0 + 41位毫秒时间戳 + 8机器id + 14位自增序列
        let base = '0' + this.utils.pad(miliSecond.toString(2), 41, '0', true) + this.utils.pad(machineId.toString(2), 8, '0', true) + this.utils.pad(count.toString(2), 14, '0', true);
        var id_bit = new bn_js_1.default(base, 2);
        return id_bit.toString();
    }
    ;
    /**
     * 获取唯一id（雪花算法 Snowflake）
     * @param machineId 机器id，可理解为不同业务场景，2^8，可选值：0~255
     */
    getUniqueId(machineId = 0) {
        return __awaiter(this, void 0, void 0, function* () {
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
            let segments = yield this.runLuaInRedis(luaScript, [
                { key: this.config.uniqueId.cacheKey, value: machineId.toString() }
            ]);
            // redis的毫秒是6位的，取前3位
            segments[1] = parseInt((segments[1] / 1000).toString());
            return this.buildUniqueId.apply(this, segments);
        });
    }
    /**
     * 从唯一id中解析出时间戳（雪花算法 Snowflake）
     * @param id id
     */
    parseUniqueId(id) {
        let id_bit = new bn_js_1.default(id, 10);
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
    start(cfg = null) {
        return __awaiter(this, void 0, void 0, function* () {
            if (cfg)
                for (let k in cfg) {
                    if (cfg[k] === null)
                        continue;
                    if (Utils.isObject(cfg[k])) {
                        this.config[k] = Utils.extend({}, DefaultConfig_1.default[k], cfg[k]);
                    }
                    else if (Utils.isArray(cfg[k])) {
                        this.config[k] = Utils.extend([], DefaultConfig_1.default[k], cfg[k]);
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
            let koaRouter = new koa_router_1.default;
            koaRouter.use((ctx, next) => __awaiter(this, void 0, void 0, function* () {
                ctx.$app = this;
                yield next();
            }));
            koaRouter.use(Request_1.default.get());
            // 自定义路由
            if (this.config.koa.routers && Utils.isArray(this.config.koa.routers)) {
                this.config.koa.routers.forEach(router => {
                    if (router.path && Utils.isString(router.path)) {
                        // 配置指定路由的中间件
                        if (router.middleware) {
                            if (router.middleware instanceof Middleware_1.default) {
                                try {
                                    koaRouter.use(router.path, router.middleware.get());
                                }
                                catch (e) {
                                    this.log.error('Invalid middleware.', e);
                                }
                                ;
                            }
                            else if (Utils.isFunction(router.middleware) || Utils.isArray(router.middleware)) {
                                try {
                                    koaRouter.use(router.path, router.middleware);
                                }
                                catch (e) {
                                    this.log.error('Invalid koa.middleware.', e);
                                }
                                ;
                            }
                        }
                        // 增加路由处理方法
                        if (router.handler && Utils.isFunction(router.handler)) {
                            router.method = router.method || 'all';
                            try {
                                koaRouter[router.method](router.path, router.handler);
                            }
                            catch (e) {
                                this.log.error('Invalid middleware.', e);
                            }
                            ;
                        }
                    }
                });
            }
            // 系统路由
            koaRouter.all('/', this.KoaHandler);
            koaRouter.all('/:module/:controller/:action', this.KoaHandler);
            koaRouter.all('/:controller/:action', this.KoaHandler);
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
                this.server.use((ctx, next) => __awaiter(this, void 0, void 0, function* () {
                    if (ctx.status === 404) {
                        if (Utils.isAjaxRequest(ctx)) {
                            ctx.type = 'application/json';
                            ctx.body = this.utils.jsonError('Server Error', '500');
                        }
                        else {
                            ctx.type = 'text/html';
                            ctx.body = this.getTemplater().renderError({
                                success: false,
                                message: 'Page not found.',
                                code: 404,
                                waitSecond: 0,
                                jumpUrl: ''
                            });
                        }
                    }
                }));
                this.server.listen(this.config.port, () => {
                    this.log.info('Current ENV: ' + this.config.env);
                    this.log.info('Framework version: ' + this.version);
                    this.log.info('Listen port: ' + this.config.port);
                });
            }
        });
    }
}
;
exports.default = Application;
