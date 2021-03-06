import { HpyerServerConfig, HpyerLuaParams, HpyerDbProvider, HpyerCacheProvider, HpyerTemplateProvider, HpyerDbSqlTransactionClosure } from '../Support/Types/Hpyer';
import * as Utils from '../Support/Utils';
import Model from './Model';
import Templater from './Templater';
import ContractSql from '../Support/Database/Contracts/ContractSql';
import ContractCache from '../Support/Cache/Contracts/ContractCache';
import Koa, { Next } from 'koa';
import Logger from '../Support/Logger';
import IORedis from 'ioredis';
/**
 * 版本号
 */
export declare const version: string;
/**
 * 是否生产环境
 */
export declare const isProduction: boolean;
/**
 * 记录日志
 */
export declare const log: Logger.RootLogger;
/**
 * 常用工具
 */
export declare const utils: typeof Utils;
/**
 * 配置项
 */
export declare let config: HpyerServerConfig;
/**
 * koa实例
 */
export declare let $koa: Koa;
/**
 * 获取模版操作实例
 * @param provider 模版供应商
 */
export declare const getTemplater: (provider?: HpyerTemplateProvider) => Templater;
/**
 * 获取数据库操作实例
 * @param {string} provider 数据库供应商
 */
export declare const getDB: (provider?: HpyerDbProvider) => ContractSql;
/**
 * 执行事务，执行完后自动提交或回滚
 * @param closure 要执行的闭包。该闭包需要接收一个 db 实例对象，以完成事务相关操作。闭包返回 false 表示需要回滚，返回其他则表示提交。
 * @param provider 数据库供应商
 * @return 闭包的返回值也是该方法的返回值
 */
export declare const transaction: (closure: HpyerDbSqlTransactionClosure, provider?: HpyerDbProvider) => Promise<any>;
/**
 * 获取redis操作实例
 * @param  options redis选项，详见: https://github.com/luin/ioredis/blob/HEAD/API.md#new_Redis_new
 * @param  tag 实例标识，默认：default
 */
export declare const getRedis: (options?: IORedis.RedisOptions, tag?: string) => IORedis.Redis;
/**
 * 获取缓存操作实例
 * @param  {string} provider 缓存驱动，可选值：file, redis
 */
export declare const getCacher: (provider?: HpyerCacheProvider) => ContractCache;
/**
 * 判断缓存是否存在
 * @param  {string} name 缓存名称
 * @param  {string} provider 缓存驱动，可选值：file, redis
 */
export declare const hasCache: (name: string, provider?: HpyerCacheProvider) => Promise<boolean>;
/**
 * 获取缓存值
 * @param  {string} name 缓存名称
 * @param  {string} provider 缓存驱动，可选值：file, redis
 */
export declare const getCache: (name: string, provider?: HpyerCacheProvider) => Promise<any>;
/**
 * 设置缓存
 * @param  {string} name 缓存名称
 * @param  {any} value 缓存值
 * @param  {integer} expireIn 时效，过期秒数，单位：秒，可选
 * @param  {string} provider 缓存驱动，可选值：file, redis
 */
export declare const setCache: (name: string, value?: any, expireIn?: number, provider?: HpyerCacheProvider) => Promise<boolean>;
/**
 * 删除缓存
 * @param  {string} name 缓存名称
 * @param  {string} provider 缓存驱动，可选值：file, redis
 */
export declare const removeCache: (name: string, provider?: HpyerCacheProvider) => Promise<boolean>;
/**
 * 获取model实例
 * @param  {string} name 服务名称
 * @param  {string} module 模块名称
 */
export declare const model: (name: string, module?: string) => Model;
/**
 * 获取service实例
 * @param  {string} name 服务名称
 */
export declare const service: (name: string) => import("./Service").default;
/**
 * Koa的控制器处理方法
 * @param ctx
 * @param next
 * @returns
 */
export declare const KoaHandler: (ctx: Koa.Context, next: Koa.Next) => Promise<Koa.Next>;
/**
 * 控制器处理方法
 * @param  module 应用名称
 * @param  controller 控制器名称
 * @param  action 方法名称
 * @param  ctx koa的上下文
 * @param  next oa的下一中间件
 */
export declare const ControllerHandler: (module: string, controller: string, action: string, ctx?: Koa.Context, next?: Koa.Next) => Promise<Koa.Next>;
/**
 * 在redis中执行lua脚本
 * @param  content 脚本内容
 * @param  params [{key: 'test', value: 10}, {key: 'test', value: 10}]
 */
export declare const runLuaInRedis: (script: string, params?: Array<HpyerLuaParams>) => Promise<any>;
/**
 * 执行系统命令
 * @param  {string} cmd 命令
 * @param  {array} args 参数，可选
 */
export declare const runCmd: (cmd: any, args?: any[]) => Promise<unknown>;
/**
 * 生成唯一id（雪花算法 Snowflake）
 * @param second 秒数，13位
 * @param microSecond 毫秒数，3位
 * @param machineId 机器id，可理解为不同业务场景，2^8，可选值：0~255
 * @param count 计数，2^14，可选值：0~16383
 */
export declare const buildUniqueId: (second: number, microSecond: number, machineId: number | string, count: number) => string;
/**
 * 获取唯一id（雪花算法 Snowflake）
 * @param machineId 机器id，可理解为不同业务场景，2^8，可选值：0~255
 */
export declare const getUniqueId: (machineId?: number | string) => Promise<string>;
/**
 * 从唯一id中解析出时间戳（雪花算法 Snowflake）
 * @param id id
 */
export declare const parseUniqueId: (id: string) => object;
/**
 * 启动服务
 * @param cfg 配置项
 * @param cb 启动后的回调函数
 */
export declare const startup: (cfg?: HpyerServerConfig, cb?: Function) => Promise<void>;
