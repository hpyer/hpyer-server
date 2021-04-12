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
exports.startup = exports.parseUniqueId = exports.getUniqueId = exports.buildUniqueId = exports.runCmd = exports.runLuaInRedis = exports.ControllerHandler = exports.KoaHandler = exports.service = exports.model = exports.removeCache = exports.setCache = exports.getCache = exports.hasCache = exports.getCacher = exports.getRedis = exports.transaction = exports.getDB = exports.getTemplater = exports.$koa = exports.config = exports.utils = exports.log = exports.isProduction = exports.version = void 0;
const path_1 = __importDefault(require("path"));
const child_process_1 = __importDefault(require("child_process"));
const Utils = __importStar(require("../Support/Utils"));
const Model_1 = __importDefault(require("./Model"));
const Templater_1 = __importDefault(require("./Templater"));
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
 * 版本号
 */
exports.version = require('../../package.json').version;
/**
 * 是否生产环境
 */
exports.isProduction = process.env.NODE_ENV == 'production';
/**
 * 记录日志
 */
exports.log = Logger_1.default;
/**
 * 常用工具
 */
exports.utils = Utils;
/**
 * 配置项
 */
exports.config = null;
/**
 * koa实例
 */
exports.$koa = null;
let _templaters = {};
/**
 * 获取模版操作实例
 * @param provider 模版供应商
 */
const getTemplater = function (provider = null) {
    if (!_templaters[provider]) {
        _templaters[provider] = new Templater_1.default(provider);
    }
    return _templaters[provider];
};
exports.getTemplater = getTemplater;
/**
 * 获取数据库操作实例
 * @param {string} provider 数据库供应商
 */
const getDB = function (provider = null) {
    if (!exports.config.db.enable)
        return null;
    if (!provider)
        provider = exports.config.db.provider;
    try {
        let fetcher = require(`../Support/Database/Providers/Provider${Utils.toStudlyCase(provider)}`);
        return fetcher.default(exports.config.db[provider]);
    }
    catch (e) {
        throw new Error(`Fail to instance cache '${provider}'.`);
    }
};
exports.getDB = getDB;
/**
 * 执行事务，执行完后自动提交或回滚
 * @param closure 要执行的闭包。该闭包需要接收一个 db 实例对象，以完成事务相关操作。闭包返回 false 表示需要回滚，返回其他则表示提交。
 * @param provider 数据库供应商
 * @return 闭包的返回值也是该方法的返回值
 */
const transaction = function (closure, provider = null) {
    return __awaiter(this, void 0, void 0, function* () {
        let db = exports.getDB(provider);
        if (!db)
            return false;
        let res = yield db.transaction(closure);
        db.disconnect();
        return res;
    });
};
exports.transaction = transaction;
/**
 * 获取redis操作实例
 * @param  options redis选项，详见: https://github.com/luin/ioredis/blob/HEAD/API.md#new_Redis_new
 */
const getRedis = function (options = null) {
    if (!options) {
        options = exports.config.cache['redis'];
    }
    if (!exports.config.cache.enable)
        return null;
    try {
        return new ioredis_1.default(options);
    }
    catch (e) {
        exports.log.error(`Fail to create Redis client.`, e);
    }
    return null;
};
exports.getRedis = getRedis;
let _cachers = {};
/**
 * 获取缓存操作实例
 * @param  {string} provider 缓存驱动，可选值：file, redis
 */
const getCacher = function (provider = null) {
    if (!exports.config.cache.enable)
        return null;
    if (!provider)
        provider = exports.config.cache.provider;
    try {
        if (!_cachers[provider]) {
            let fetcher = require(`../Support/Cache/Providers/Provider${Utils.toStudlyCase(provider)}`);
            _cachers[provider] = fetcher.default(exports.config.cache[provider]);
        }
        return _cachers[provider];
    }
    catch (e) {
        throw new Error(`Fail to instance cache '${provider}'.`);
    }
};
exports.getCacher = getCacher;
/**
 * 判断缓存是否存在
 * @param  {string} name 缓存名称
 * @param  {string} provider 缓存驱动，可选值：file, redis
 */
const hasCache = function (name, provider = null) {
    return __awaiter(this, void 0, void 0, function* () {
        let cacher = exports.getCacher(provider);
        if (!cacher)
            return null;
        return cacher.has(name);
    });
};
exports.hasCache = hasCache;
/**
 * 获取缓存值
 * @param  {string} name 缓存名称
 * @param  {string} provider 缓存驱动，可选值：file, redis
 */
const getCache = function (name, provider = null) {
    return __awaiter(this, void 0, void 0, function* () {
        let cacher = exports.getCacher(provider);
        if (!cacher)
            return null;
        return cacher.get(name);
    });
};
exports.getCache = getCache;
/**
 * 设置缓存
 * @param  {string} name 缓存名称
 * @param  {any} value 缓存值
 * @param  {integer} expireIn 时效，过期秒数，单位：秒，可选
 * @param  {string} provider 缓存驱动，可选值：file, redis
 */
const setCache = function (name, value = null, expireIn = 0, provider = null) {
    return __awaiter(this, void 0, void 0, function* () {
        let cacher = exports.getCacher(provider);
        if (!cacher)
            return false;
        return cacher.set(name, value, expireIn);
    });
};
exports.setCache = setCache;
/**
 * 删除缓存
 * @param  {string} name 缓存名称
 * @param  {string} provider 缓存驱动，可选值：file, redis
 */
const removeCache = function (name, provider = null) {
    return __awaiter(this, void 0, void 0, function* () {
        let cacher = exports.getCacher(provider);
        if (!cacher)
            return false;
        return cacher.del(name);
    });
};
exports.removeCache = removeCache;
/**
 * 获取model实例
 * @param  {string} name 服务名称
 * @param  {string} module 模块名称
 */
const model = function (name, module = null) {
    try {
        let tag = name;
        if (module)
            tag = module + '-' + name;
        if (!modelInstances[tag]) {
            let modelClass;
            try {
                let path = exports.config.root.models;
                if (module) {
                    path = exports.config.root.modules + '/' + module + '/' + exports.config.defaultModelDir + '/';
                }
                exports.log.debug('model', path + name);
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
        }
        return modelInstances[tag];
    }
    catch (e) {
        exports.log.error('Model `' + name + '` not found.', e);
        throw e;
    }
};
exports.model = model;
/**
 * 获取service实例
 * @param  {string} name 服务名称
 */
const service = function (name) {
    try {
        if (!serviceInstances[name]) {
            let path = exports.config.root.services;
            serviceInstances[name] = new (require(path + name));
        }
        return serviceInstances[name];
    }
    catch (e) {
        exports.log.error('Service `' + name + '` not found.', e);
        throw e;
    }
};
exports.service = service;
/**
 * Koa的控制器处理方法
 */
const KoaHandler = function (ctx, next) {
    let module = ctx.params.module || exports.config.defaultModuleName;
    let controller = ctx.params.controller || exports.config.defaultControllerName;
    let action = ctx.params.action || exports.config.defaultActionName;
    return exports.ControllerHandler(module, controller, action, ctx, next);
};
exports.KoaHandler = KoaHandler;
/**
 * 控制器处理方法
 * @param  module 应用名称
 * @param  controller 控制器名称
 * @param  action 方法名称
 * @param  ctx koa的上下文
 * @param  next oa的下一中间件
 */
const ControllerHandler = function (module, controller, action, ctx = null, next = null) {
    return __awaiter(this, void 0, void 0, function* () {
        module = module || exports.config.defaultModuleName;
        controller = controller || exports.config.defaultControllerName;
        action = action || exports.config.defaultActionName;
        let instance;
        try {
            let path = path_1.default.resolve(exports.config.root.modules + '/' + module + '/' + exports.config.defaultControllerDir + '/') + '/';
            exports.log.debug('controller', path + controller);
            instance = new (require(path + controller));
        }
        catch (e) {
            exports.log.error('Controller `' + controller + '` not found.', e);
            if (ctx)
                ctx.response.status = 404;
            return next ? yield next() : false;
        }
        if (!Utils.isFunction(instance[action + 'Action'])) {
            exports.log.error('Action `' + action + '` not found.');
            if (ctx)
                ctx.response.status = 404;
            return next ? yield next() : false;
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
            exports.log.error('Action `' + action + '` occurred a fatal error.', e);
            ctx.status = 500;
            if (Utils.isAjaxRequest(ctx)) {
                ctx.type = 'application/json';
                ctx.body = Utils.jsonError('Server Error', '500');
            }
            else {
                ctx.type = 'text/html';
                ctx.body = exports.getTemplater().renderError({
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
};
exports.ControllerHandler = ControllerHandler;
let _redisClient = null;
/**
 * 在redis中执行lua脚本
 * @param  content 脚本内容
 * @param  params [{key: 'test', value: 10}, {key: 'test', value: 10}]
 */
const runLuaInRedis = function (script, params = null) {
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
            if (!_redisClient) {
                _redisClient = exports.getRedis();
            }
            let res = yield _redisClient.eval(args);
            return res;
        }
        catch (e) {
            exports.log.error(`Fail to run lua script in redis.`, e);
        }
        ;
        return false;
    });
};
exports.runLuaInRedis = runLuaInRedis;
/**
 * 执行系统命令
 * @param  {string} cmd 命令
 * @param  {array} args 参数，可选
 */
const runCmd = function (cmd, args = []) {
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
exports.runCmd = runCmd;
/**
 * 生成唯一id（雪花算法 Snowflake）
 * @param second 秒数，13位
 * @param microSecond 毫秒数，3位
 * @param machineId 机器id，可理解为不同业务场景，2^8，可选值：0~255
 * @param count 计数，2^14，可选值：0~16383
 */
const buildUniqueId = function (second, microSecond, machineId, count) {
    let miliSecond = second * 1000 + microSecond - exports.config.uniqueId.epoch;
    // 0 + 41位毫秒时间戳 + 8机器id + 14位自增序列
    let base = '0' + exports.utils.pad(miliSecond.toString(2), 41, '0', true) + exports.utils.pad(machineId.toString(2), 8, '0', true) + exports.utils.pad(count.toString(2), 14, '0', true);
    var id_bit = new bn_js_1.default(base, 2);
    return id_bit.toString();
};
exports.buildUniqueId = buildUniqueId;
/**
 * 获取唯一id（雪花算法 Snowflake）
 * @param machineId 机器id，可理解为不同业务场景，2^8，可选值：0~255
 */
const getUniqueId = function (machineId = 0) {
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
        let segments = yield exports.runLuaInRedis(luaScript, [
            { key: exports.config.uniqueId.cacheKey, value: machineId.toString() }
        ]);
        // redis的毫秒是6位的，取前3位
        segments[1] = parseInt((segments[1] / 1000).toString());
        return exports.buildUniqueId.apply(this, segments);
    });
};
exports.getUniqueId = getUniqueId;
/**
 * 从唯一id中解析出时间戳（雪花算法 Snowflake）
 * @param id id
 */
const parseUniqueId = function (id) {
    let id_bit = new bn_js_1.default(id, 10);
    // 回填为64位
    let base = exports.utils.pad(id_bit.toString(2), 64, '0', true);
    let timestamp = parseInt(base.substr(1, 41), 2) + exports.config.uniqueId.epoch;
    let machineId = parseInt(base.substr(42, 8), 2);
    let count = parseInt(base.substr(50, 14), 2);
    return { timestamp, machineId, count };
};
exports.parseUniqueId = parseUniqueId;
/**
 * 启动服务
 * @param cfg 配置项
 */
const startup = function (cfg = null) {
    return __awaiter(this, void 0, void 0, function* () {
        if (cfg)
            for (let k in cfg) {
                if (cfg[k] === null)
                    continue;
                const DefaultConfig = (yield Promise.resolve().then(() => __importStar(require('../Support/DefaultConfig')))).default;
                if (exports.config === null) {
                    exports.config = DefaultConfig;
                }
                if (Utils.isObject(cfg[k])) {
                    exports.config[k] = Utils.extend({}, DefaultConfig[k], cfg[k]);
                }
                else if (Utils.isArray(cfg[k])) {
                    exports.config[k] = Utils.extend([], DefaultConfig[k], cfg[k]);
                }
                else {
                    exports.config[k] = cfg[k];
                }
            }
        if (!exports.config.root.modules) {
            throw new Error('NOT set modules root');
        }
        if (!exports.config.root.models) {
            throw new Error('NOT set models root');
        }
        if (!exports.config.root.services) {
            throw new Error('NOT set services root');
        }
        if (!exports.config.root.errors) {
            throw new Error('NOT set errors root');
        }
        exports.config.root.modules = Utils.rtrim(exports.config.root.modules, '\\/+') + '/';
        exports.config.root.models = Utils.rtrim(exports.config.root.models, '\\/+') + '/';
        exports.config.root.services = Utils.rtrim(exports.config.root.services, '\\/+') + '/';
        exports.config.root.errors = Utils.rtrim(exports.config.root.errors, '\\/+') + '/';
        // 系统请求处理方法
        let koaRouter = new koa_router_1.default;
        const MiddlewareRequest = (yield Promise.resolve().then(() => __importStar(require('../Support/Middlewares/Request')))).default;
        koaRouter.use(MiddlewareRequest);
        // 自定义路由
        if (exports.config.koa.routers && Utils.isArray(exports.config.koa.routers)) {
            exports.config.koa.routers.forEach(router => {
                if (router.path && Utils.isString(router.path)) {
                    // 配置指定路由的中间件
                    if (router.middleware) {
                        if (Utils.isFunction(router.middleware) || Utils.isArray(router.middleware)) {
                            try {
                                koaRouter.use(router.path, router.middleware);
                            }
                            catch (e) {
                                exports.log.error('Invalid koa.middleware.', e);
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
                            exports.log.error('Invalid middleware.', e);
                        }
                        ;
                    }
                }
            });
        }
        // 系统路由
        koaRouter.all('/', exports.KoaHandler);
        koaRouter.all('/:module/:controller/:action', exports.KoaHandler);
        koaRouter.all('/:controller/:action', exports.KoaHandler);
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
                exports.ControllerHandler(module, controller, action).then(() => {
                    process.exit(0);
                });
            }
            else {
                exports.log.error('Router `' + argv2 + '` not found');
            }
        }
        else {
            exports.$koa = new koa_1.default();
            exports.$koa.keys = [exports.config.key];
            exports.$koa.use(KoaBody_1.default(exports.config.koa.body));
            exports.$koa.use(koa_session_1.default(exports.config.koa.session, exports.$koa));
            if (exports.config.koa.statics && Utils.isArray(exports.config.koa.statics))
                exports.config.koa.statics.forEach(path => {
                    exports.$koa.use(koa_static_1.default(path_1.default.resolve(path)));
                });
            exports.$koa.use(koaRouter.routes()).use(koaRouter.allowedMethods());
            // 404
            exports.$koa.use((ctx, next) => __awaiter(this, void 0, void 0, function* () {
                if (ctx.status === 404) {
                    if (Utils.isAjaxRequest(ctx)) {
                        ctx.type = 'application/json';
                        ctx.body = exports.utils.jsonError('Server Error', '500');
                    }
                    else {
                        ctx.type = 'text/html';
                        ctx.body = exports.getTemplater().renderError({
                            success: false,
                            message: 'Page not found.',
                            code: 404,
                            waitSecond: 0,
                            jumpUrl: ''
                        });
                    }
                }
            }));
            exports.$koa.listen(exports.config.port, () => {
                exports.log.info('Current ENV: ' + exports.config.env);
                exports.log.info('Framework version: ' + exports.version);
                exports.log.info('Listen port: ' + exports.config.port);
            });
        }
    });
};
exports.startup = startup;
