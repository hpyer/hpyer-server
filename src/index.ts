
import Application from './Core/Application';
import Controller from './Core/Controller';
import Model from './Core/Model';
import Service from './Core/Service';
import Middleware from './Core/Middleware';
import Config from './Support/Config';
import * as Utils from './Support/Utils';

/**
 * 框架
 */
export const HpyerApplication = Application;
/**
 * 控制器基类
 */
export const HpyerController = Controller;
/**
 * 模型基类
 */
export const HpyerModel = Model;
/**
 * 服务基类
 */
export const HpyerService = Service;
/**
 * 中间件封装方法
 */
export const HpyerMiddleware = Middleware;
/**
 * 配置基类
 */
export const HpyerConfig = Config;
/**
 * 工具集合
 */
export const HpyerUtils = Utils;
