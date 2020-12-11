
import { ConnectionConfig } from "mysql";
import { ConfigureOptions } from "nunjucks";
import { RedisOptions } from "ioredis";
import Model from "../../Core/Model";
import Service from "../../Core/Service";

export interface HashMap {
  [key: string]: any,
}

export interface HpyerModelMap {
  [key: string]: Model
}

export interface HpyerServiceMap {
  [key: string]: Service
}

export interface HpyerLuaParams {
  key: string;
  value?: string;
}

export enum HpyerApplicationEnv {
  DEVELOPMENT = 'development',
  TEST = 'test',
  STAGING = 'staging',
  PRODUCTION = 'production',
}

export enum HpyerDbProvider {
  MYSQL = 'mysql',
}

export enum HpyerCacheProvider {
  FILE = 'file',
  REDIS = 'redis',
}

export enum HpyerTemplateProvider {
  NUNJUCKS = 'nunjucks',
}

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

export interface HpyerServerConfigKoaSession {
  key?: string;
  maxAge?: number;
  overwrite?: boolean;
  httpOnly?: boolean;
  signed?: boolean;
  rolling?: boolean;
  renew?: boolean;
}

export interface HpyerServerConfigKoaRouter {
  path?: string;
  middleware?: Function;
  method?: string;
  handler?: Function;
}

export interface HpyerServerConfigKoa {
  body?: HpyerServerConfigKoaBody;
  session?: HpyerServerConfigKoaSession;
  statics?: Array<string>;
  routers?: Array<HpyerServerConfigKoaRouter>;
}

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
   * redis缓存选项，详见: https://github.com/luin/ioredis/blob/HEAD/API.md#new_Redis_new
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
   * redis 唯一id相关配置
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

};
