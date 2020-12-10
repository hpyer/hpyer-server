import { HashMap, HpyerConfig, HpyerLuaParams, HpyerDbProvider, HpyerCacheProvider } from '../Support/Types/Hpyer';
import LogLevel from 'loglevel';
import * as Utils from '../Support/Utils';
import Model from './Model';
import Service from './Service';
import ContractSql from '../Support/Database/Contracts/ContractSql';
import ContractCache from '../Support/Cache/Contracts/ContractCache';
import Koa from 'koa';
import IORedis from 'ioredis';
declare class Application {
    /**
     * 版本号
     */
    version: string;
    /**
     * 是否生产环境
     */
    isProduction: boolean;
    /**
     * 记录日志
     */
    log: LogLevel.RootLogger;
    /**
     * 常用工具
     */
    utils: typeof Utils;
    /**
     * 配置项
     */
    config: HpyerConfig;
    /**
     * koa实例
     */
    server: Koa;
    /**
     * 是否ajax请求
     * @param  {object}  ctx  koa的上下文
     * @return {boolean}
     */
    isAjax(ctx: Koa.Context): boolean;
    doRequest(payload: HashMap, returnResponse?: boolean): Promise<any>;
    /**
     * 获取数据库操作实例
     * @param {string} provider 数据库供应商
     * @return {object}
     */
    getDB(provider?: HpyerDbProvider): Promise<ContractSql>;
    /**
     * 获取redis操作实例
     * @param  options 缓存驱动，可选
     */
    getRedis(options?: IORedis.RedisOptions): IORedis.Redis;
    /**
     * 获取缓存操作实例
     * @param  {string} provider 缓存驱动，可选
     * @return {object}
     */
    getCacher(provider?: HpyerCacheProvider): ContractCache;
    /**
     * 判断缓存是否存在
     * @param  {string} name 缓存名称
     * @param  {string} provider 缓存驱动，可选
     * @return {boolean}
     */
    hasCache(name: string, provider?: HpyerCacheProvider): Promise<boolean>;
    /**
     * 获取缓存值
     * @param  {string} name 缓存名称
     * @param  {string} provider 缓存驱动，可选
     * @return {any}
     */
    getCache(name: string, provider?: HpyerCacheProvider): Promise<any>;
    /**
     * 设置缓存
     * @param  {string} name 缓存名称
     * @param  {any} value 缓存值
     * @param  {integer} expireIn 时效，过期秒数，单位：秒，可选
     * @param  {string} provider 缓存驱动，可选
     * @return {boolean}
     */
    setCache(name: string, value?: any, expireIn?: number, provider?: HpyerCacheProvider): Promise<boolean>;
    /**
     * 删除缓存
     * @param  {string} name 缓存名称
     * @param  {string} provider 缓存驱动，可选
     * @return {boolean}
     */
    removeCache(name: string, provider?: HpyerCacheProvider): Promise<boolean>;
    /**
     * 在redis中执行lua脚本
     * @param  {string} file_name 脚本名称（含扩展名）
     * @param  {array} params [{key: 'test', value: 10}, {key: 'test', value: 10}]
     * @return {boolean}
     */
    runLuaInRedis(file_name: string, params: Array<HpyerLuaParams>): Promise<any>;
    /**
     * 获取model实例
     * @param  {string} name 服务名称
     * @param  {string} module 模块名称
     * @return {object}
     */
    model(name: string, module?: string): Model;
    /**
     * 获取service实例
     * @param  {string} name 服务名称
     * @return {object}
     */
    service(name: string): Service;
    /**
     * Koa的控制器处理方法
     * @param  ctx koa的上下文
     * @param  next koa的下一中间件
     */
    KoaHandler(ctx: Koa.Context, next: Koa.Next): Promise<Koa.Next>;
    /**
     * 控制器处理方法
     * @param  module 应用名称
     * @param  controller 控制器名称
     * @param  action 方法名称
     * @param  ctx koa的上下文
     * @param  next oa的下一中间件
     */
    ControllerHandler(module: string, controller: string, action: string, ctx?: Koa.Context, next?: Koa.Next): Promise<Koa.Next>;
    /**
     * 执行计划任务
     * @return {void}
     */
    runCron(): void;
    start(cfg?: HpyerConfig): Promise<void>;
}
export default Application;
