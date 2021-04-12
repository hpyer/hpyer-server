
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
export const defineMiddleware = function (func: HpyerServerKoaMiddleware): HpyerServerKoaMiddleware {
  return func;
}

/**
 * 声明配置
 * @param func koa2中间件
 * @returns
 */
export const defineConfig = function (cfg: HpyerServerConfig): HpyerServerConfig {
  return cfg;
}

/**
 * 框架
 */
export const Hpyer = Application;
/**
 * 控制器基类
 */
export const Controller = BaseController;
/**
 * 模型基类
 */
export const Model = BaseModel;
/**
 * 服务基类
 */
export const Service = BaseService;
