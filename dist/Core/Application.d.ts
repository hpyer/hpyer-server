import { HashMap, HpyerServerConfig, HpyerLuaParams, HpyerDbProvider, HpyerCacheProvider } from '../Support/Types/Hpyer';
import * as Utils from '../Support/Utils';
import Model from './Model';
import Service from './Service';
import ContractSql from '../Support/Database/Contracts/ContractSql';
import ContractCache from '../Support/Cache/Contracts/ContractCache';
import Koa from 'koa';
import LogLevel from 'loglevel';
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
    config: HpyerServerConfig;
    /**
     * koa实例
     */
    server: Koa;
    constructor();
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
     */
    KoaHandler(): Function;
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
     * 在redis中执行lua脚本
     * @param  content 脚本内容
     * @param  params [{key: 'test', value: 10}, {key: 'test', value: 10}]
     */
    runLuaInRedis(script: string, params?: Array<HpyerLuaParams>): Promise<any>;
    /**
     * 执行系统命令
     * @param  {string} cmd 命令
     * @param  {array} args 参数，可选
     * @return {promise}
     */
    runCmd: (cmd: any, args?: any[]) => Promise<unknown>;
    /**
     * 生成唯一id（雪花算法 Snowflake）
     * @param second 秒数，13位
     * @param microSecond 毫秒数，3位
     * @param machineId 机器id，可理解为不同业务场景，2^8，可选值：0~255
     * @param count 计数，2^14，可选值：0~16383
     */
    buildUniqueId(second: number, microSecond: number, machineId: number | string, count: number): string;
    /**
     * 获取唯一id（雪花算法 Snowflake）
     * @param machineId 机器id，可理解为不同业务场景，2^8，可选值：0~255
     */
    getUniqueId(machineId?: number | string): Promise<string>;
    /**
     * 从唯一id中解析出时间戳（雪花算法 Snowflake）
     * @param id id
     */
    parseUniqueId(id: string): object;
    /**
     * 启动服务
     * @param cfg 配置项
     */
    start(cfg?: HpyerServerConfig): Promise<void>;
}
export default Application;
