import { ConnectionConfig } from "mysql";
import { ConfigureOptions } from "nunjucks";
import { RedisOptions } from "ioredis";
import Model from "../../Core/Model";
import Service from "../../Core/Service";
export interface HashMap {
    [key: string]: any;
}
export interface HpyerModelMap {
    [key: string]: Model;
}
export interface HpyerServiceMap {
    [key: string]: Service;
}
export interface HpyerLuaParams {
    key: string;
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
export interface HpyerConfigRoot {
    /**
     * modules 所在目录
     */
    modules?: string;
    /**
     * 公用 model 所在目录
     */
    models?: string;
    /**
     * 公用 service 所在目录
     */
    services?: string;
    /**
     * 错误页面所在目录
     */
    errors?: string;
    /**
     * lua脚本所在目录
     */
    luas?: string;
}
export interface HpyerConfigUniqueId {
    /**
     * redis 的hash键名
     */
    cacheKey?: string;
    /**
     * 世纪，用于减少生成的id数字大小，单位：毫秒，如：1300000000000
     */
    epoch?: string | number;
}
export interface HpyerConfigKoaBody {
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
export interface HpyerConfigKoaSession {
    key?: string;
    maxAge?: number;
    overwrite?: boolean;
    httpOnly?: boolean;
    signed?: boolean;
    rolling?: boolean;
    renew?: boolean;
}
export interface HpyerConfigKoaRouter {
    path?: string;
    middleware?: Function;
    method?: string;
    handler?: Function;
}
export interface HpyerConfigKoa {
    body?: HpyerConfigKoaBody;
    session?: HpyerConfigKoaSession;
    statics?: Array<string>;
    routers?: Array<HpyerConfigKoaRouter>;
}
export interface HpyerConfigDb {
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
export interface HpyerConfigDbQueryOption {
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
export interface HpyerConfigCacheFileOptions {
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
export interface HpyerConfigCache {
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
    file: HpyerConfigCacheFileOptions;
    /**
     * redis缓存选项，详见: https://www.npmjs.com/package/redis#options-object-properties
     */
    redis: RedisOptions;
}
/**
 * 模版配置项
 */
export interface HpyerConfigTemplate {
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
 * 计划任务配置项
 */
export interface HpyerConfigCronJob {
    /**
     * 定时时间，同 linux 的 cronjob
     */
    time: string;
    /**
     * 要执行的任务的路由地址
     */
    path: string;
    /**
     * 是否在服务启动时立即执行
     */
    immediate: boolean;
    /**
     * 任务是否有效
     */
    enable: boolean;
}
/**
 * 计划任务模块配置
 */
export interface HpyerConfigCron {
    /**
     * 默认的错误页面模版
     */
    enable: boolean;
    /**
     * 模版文件扩展名
     */
    jobs: Array<HpyerConfigCronJob>;
}
/**
 * 框架配置
 */
export interface HpyerConfig {
    /**
     * 当前启动脚本（即启动服务的脚本），仅影响计划任务的执行。未配置时，系统会尝试自动获取，建议配置为：__filename
     */
    entry: string;
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
    root: HpyerConfigRoot;
    /**
     * redis 唯一id相关配置
     */
    uniqueId: HpyerConfigUniqueId;
    /**
     * koa 相关配置
     */
    koa: HpyerConfigKoa;
    /**
     * 数据库相关配置
     */
    db: HpyerConfigDb;
    /**
     * 缓存相关配置
     */
    cache: HpyerConfigCache;
    /**
     * 模版相关选项
     */
    template: HpyerConfigTemplate;
    /**
     * 计划任务相关配置
     */
    cron: HpyerConfigCron;
}
