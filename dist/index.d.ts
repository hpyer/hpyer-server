import * as Application from './Core/Application';
import BaseController from './Core/Controller';
import BaseModel from './Core/Model';
import BaseService from './Core/Service';
import { HpyerServerConfig, HpyerServerKoaMiddleware } from './Support/Types/Hpyer';
/**
 * 声明中间件
 * @param func koa2中间件
 * @returns
 */
export declare const defineMiddleware: (func: HpyerServerKoaMiddleware) => HpyerServerKoaMiddleware;
/**
 * 声明配置
 * @param func koa2中间件
 * @returns
 */
export declare const defineConfig: (cfg: HpyerServerConfig) => HpyerServerConfig;
/**
 * 框架
 */
export declare const Hpyer: typeof Application;
/**
 * 控制器基类
 */
export declare const Controller: typeof BaseController;
/**
 * 模型基类
 */
export declare const Model: typeof BaseModel;
/**
 * 服务基类
 */
export declare const Service: typeof BaseService;
