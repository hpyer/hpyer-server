import { HpyerApplicationEnv, HpyerServerConfigRoot, HpyerServerConfigUniqueId, HpyerServerConfigKoa, HpyerServerConfigDb, HpyerServerConfigCache, HpyerServerConfigTemplate, HpyerServerConfig } from "./Types/Hpyer";
/**
 * 框架配置对象
 */
export default class Config {
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
    constructor(options?: HpyerServerConfig);
}
