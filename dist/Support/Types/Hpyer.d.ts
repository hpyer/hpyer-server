import { ConnectionConfig } from "mysql";
import { ConfigureOptions } from "nunjucks";
import { RedisOptions } from "ioredis";
import Model from "../../Core/Model";
import Service from "../../Core/Service";
import Middleware from "../../Core/Middleware";
import { DefaultContext, BaseRequest, DefaultState, Middleware as KoaMiddleware, ParameterizedContext, Next } from "koa";
import Application from '../../Core/Application';
/**
 * Koa请求对象
 */
export interface HpyerServerKoaRequest extends BaseRequest {
    /**
     * 是否ajax请求
     */
    is_ajax?: boolean;
    /**
     * 客户端ip
     */
    client_ip?: string;
    /**
     * query的数据
     */
    query: object;
    /**
     * query的原始数据
     */
    query_raw?: object;
    /**
     * post的数据
     */
    post?: object;
    /**
     * post的原始数据
     */
    post_raw?: object;
}
/**
 * Koa上下文对象
 */
export interface HpyerServerKoaContext extends DefaultContext {
    /**
     * 应用实例
     */
    $app?: Application;
    /**
     * Koa请求对象
     */
    request?: HpyerServerKoaRequest;
}
/**
 * Koa状态对象
 */
export interface HpyerServerKoaState extends DefaultState {
}
/**
 * Koa中间件类型
 */
export declare type HpyerServerKoaMiddleware<StateT = HpyerServerKoaState, CustomT = HpyerServerKoaContext> = (context: ParameterizedContext<StateT, CustomT>, next: Next) => any;
export interface HashMap {
    [key: string]: any;
}
export interface HpyerModelMap {
    [key: string]: Model;
}
export interface HpyerServiceMap {
    [key: string]: Service;
}
/**
 * lua 参数对象
 */
export interface HpyerLuaParams {
    /**
     * 键名
     */
    key: string;
    /**
     * 键值
     */
    value?: string;
}
export declare enum HpyerApplicationEnv {
    DEVELOPMENT = "development",
    TEST = "test",
    STAGING = "staging",
    PRODUCTION = "production"
}
export declare enum HpyerDbProvider {
    MYSQL = "mysql"
}
export declare enum HpyerCacheProvider {
    FILE = "file",
    REDIS = "redis"
}
export declare enum HpyerTemplateProvider {
    NUNJUCKS = "nunjucks"
}
/**
 * 目录相关配置
 */
export interface HpyerServerConfigRoot {
    /**
     * modules 所在目录
     */
    modules: string;
    /**
     * 公用 model 所在目录
     */
    models: string;
    /**
     * 公用 service 所在目录
     */
    services: string;
    /**
     * 错误页面所在目录
     */
    errors: string;
}
/**
 * 唯一id发号器相关配置（雪花算法）
 */
export interface HpyerServerConfigUniqueId {
    /**
     * redis 的hash键名
     */
    cacheKey?: string;
    /**
     * 世纪，用于减少生成的id数字大小，单位：毫秒，如：1300000000000
     */
    epoch?: number;
}
/**
 * koa-body 解析器相关配置
 */
export interface HpyerServerConfigKoaBody {
    /**
     * 是否返回原始报文
     */
    includeUnparsed?: boolean;
    /**
     * 是否解析多媒体内容
     */
    multipart?: boolean;
    /**
     * 是否解析json
     */
    json?: boolean;
    /**
     * json内容长度限制
     */
    jsonLimit?: string;
    /**
     * 表单内容长度限制
     */
    formLimit?: string;
    /**
     * 是否解析文本
     */
    text?: boolean;
    /**
     * 文本内容长度限制
     */
    textLimit?: string;
    /**
     * 是否解析xml
     */
    xml?: boolean;
    /**
     * xml内容长度限制
     */
    xmlLimit?: string;
}
/**
 * koa-session 相关配置
 */
export interface HpyerServerConfigKoaSession {
    /**
     * 对应的cookie名称，默认：koa:sess
     */
    key?: string;
    /**
     * 有效期，填数字或 'session'
     *
     * 如果是数字，单位：毫秒，默认：1天
     *
     * 如果是 'session'，则浏览器关闭后失效
     */
    maxAge?: number | 'session';
    /**
     * 是否可重写，默认：true
     */
    overwrite?: boolean;
    /**
     * 是否 http only，默认：true
     */
    httpOnly?: boolean;
    /**
     * 是否签名，默认：true
     */
    signed?: boolean;
    /**
     * 是否在每次服务器作出响应时，更新cookie的有效期为 maxAge，默认：false
     */
    rolling?: boolean;
    /**
     * 快过期时，是否刷新cookie，以保持用户登录状态，默认：false
     */
    renew?: boolean;
}
/**
 * 自定义路由
 */
export interface HpyerServerConfigKoaRouter {
    /**
     * 访问路径，如：/api/user/login、/api/(.*)
     */
    path?: string;
    /**
     * 中间件，Koa.Middleware 或 HpyerMiddleware 实例，在 handler 之前执行
     */
    middleware?: HpyerServerKoaMiddleware | Middleware;
    /**
     * 请求方式，如：all、get、post等，默认：all
     */
    method?: string;
    /**
     * 路由的处理方法，实际上也是一个 Koa.Middleware 实例
     *
     * 如需要自定义特殊url，可在此方法中调用 ctx.$app.ControllerHandler 方法，以映射到对应的控制器中
     *
     * 如：async (ctx, next) => {
     *
     *   let module = 'api', controller = 'user', action = 'login';
     *
     *   await ctx.$app.ControllerHandler(module, controller, action, ctx, next);
     *
     * }
     */
    handler?: KoaMiddleware;
}
/**
 * koa 相关配置
 */
export interface HpyerServerConfigKoa {
    /**
     * koa-body 相关配置
     */
    body?: HpyerServerConfigKoaBody;
    /**
     * koa-session 相关配置，详见：https://www.npmjs.com/package/koa-session
     */
    session?: HpyerServerConfigKoaSession;
    /**
     * 需要加载的静态资源目录列表
     */
    statics?: Array<string>;
    /**
     * 自定义路由列表
     */
    routers?: Array<HpyerServerConfigKoaRouter>;
}
/**
 * 数据库相关配置
 */
export interface HpyerServerConfigDb {
    /**
     * 是否启用
     */
    enable?: boolean;
    /**
     * 数据库驱动
     */
    provider?: HpyerDbProvider;
    /**
     * mysql 相关配置，详见：https://www.npmjs.com/package/mysql
     */
    mysql?: ConnectionConfig;
}
export interface HpyerServerConfigDbQueryOption {
    /**
     * 查询字段
     */
    fields?: string;
    /**
     * 偏移量
     */
    offset?: number;
    /**
     * 每页记录数
     */
    limit?: number;
    /**
     * 排序
     */
    order?: string;
    /**
     * 是否行锁
     */
    lock?: boolean;
}
/**
 * 文件缓存相关配置
 */
export interface HpyerServerConfigCacheFileOptions {
    /**
     * 缓存文件存储位置
     */
    path: string;
    /**
     * 缓存目录权限
     */
    dirMode: number | string;
    /**
     * 缓存文件权限
     */
    fileMode: number | string;
    /**
     * 缓存文件扩展名
     */
    ext: string;
}
/**
 * 缓存相关配置
 */
export interface HpyerServerConfigCache {
    /**
     * 是否启用
     */
    enable?: boolean;
    /**
     * 缓存驱动，目前支持：'file', 'redis'
     */
    provider: HpyerCacheProvider;
    /**
     * 文件缓存的选项
     */
    file: HpyerServerConfigCacheFileOptions;
    /**
     * redis选项，详见: https://github.com/luin/ioredis/blob/HEAD/API.md#new_Redis_new
     */
    redis: RedisOptions;
}
/**
 * 模版配置项
 */
export interface HpyerServerConfigTemplate {
    /**
     * 模版提供商
     */
    provider: HpyerTemplateProvider;
    /**
     * 默认的错误页面模版
     */
    defaultMessageTpl: string;
    /**
     * 模版文件扩展名
     */
    tplExtention: string;
    /**
     * nunjucks配置，详见：https://mozilla.github.io/nunjucks/
     */
    nunjucks: ConfigureOptions;
}
/**
 * 框架配置
 */
export interface HpyerServerConfig {
    /**
     * 服务端口
     */
    port: string | number;
    /**
     * 加密密钥
     */
    key: string;
    /**
     * 运行环境，可自定义。如：develop / test / production
     */
    env: HpyerApplicationEnv;
    /**
     * 默认 model 目录名
     */
    defaultModelDir: string;
    /**
     * 默认 controller 目录名
     */
    defaultControllerDir: string;
    /**
     * 默认 view 目录名
     */
    defaultViewDir: string;
    /**
     * 默认 module 名
     */
    defaultModuleName: string;
    /**
     * 默认 controller 名
     */
    defaultControllerName: string;
    /**
     * 默认 action 名
     */
    defaultActionName: string;
    /**
     * 各主要目录
     */
    root: HpyerServerConfigRoot;
    /**
     * 唯一id发号器相关配置（雪花算法），需开启 redis
     */
    uniqueId: HpyerServerConfigUniqueId;
    /**
     * koa 相关配置
     */
    koa: HpyerServerConfigKoa;
    /**
     * 数据库相关配置
     */
    db: HpyerServerConfigDb;
    /**
     * 缓存相关配置
     */
    cache: HpyerServerConfigCache;
    /**
     * 模版相关选项
     */
    template: HpyerServerConfigTemplate;
}
