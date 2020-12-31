
import { HpyerApplicationEnv, HpyerServerConfigRoot, HpyerServerConfigUniqueId, HpyerServerConfigKoa, HpyerServerConfigDb, HpyerServerConfigCache, HpyerServerConfigTemplate, HpyerServerConfig } from "./Types/Hpyer";
import * as Utils from './Utils';

/**
 * 框架配置对象
 */
export default class Config {
  /**
   * 服务端口
   */
  port: string | number = null;
  /**
   * 加密密钥
   */
  key: string = null;
  /**
   * 运行环境，可自定义。如：develop / test / production
   */
  env: HpyerApplicationEnv = null;

  /**
   * 默认 model 目录名
   */
  defaultModelDir: string = null;
  /**
   * 默认 controller 目录名
   */
  defaultControllerDir: string = null;
  /**
   * 默认 view 目录名
   */
  defaultViewDir: string = null;

  /**
   * 默认 module 名
   */
  defaultModuleName: string = null;
  /**
   * 默认 controller 名
   */
  defaultControllerName: string = null;
  /**
   * 默认 action 名
   */
  defaultActionName: string = null;

  /**
   * 各主要目录
   */
  root: HpyerServerConfigRoot = null;

  /**
   * redis 唯一id相关配置
   */
  uniqueId: HpyerServerConfigUniqueId = null;

  /**
   * koa 相关配置
   */
  koa: HpyerServerConfigKoa = null;

  /**
   * 数据库相关配置
   */
  db: HpyerServerConfigDb = null;

  /**
   * 缓存相关配置
   */
  cache: HpyerServerConfigCache = null;

  /**
   * 模版相关选项
   */
  template: HpyerServerConfigTemplate = null;

  constructor(options: HpyerServerConfig = null) {
    if (options) for (let k in options) {
      if (options[k] === null) continue;
      this[k] = Utils.merge(this[k], options[k]);
    }
  }

};
