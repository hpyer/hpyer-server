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
export declare const HpyerApplication: typeof Application;
/**
 * 控制器基类
 */
export declare const HpyerController: typeof Controller;
/**
 * 模型基类
 */
export declare const HpyerModel: typeof Model;
/**
 * 服务基类
 */
export declare const HpyerService: typeof Service;
/**
 * 中间件封装方法
 */
export declare const HpyerMiddleware: typeof Middleware;
/**
 * 配置基类
 */
export declare const HpyerConfig: typeof Config;
/**
 * 工具集合
 */
export declare const HpyerUtils: typeof Utils;
