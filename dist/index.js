"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Service = exports.Model = exports.Controller = exports.Hpyer = exports.defineConfig = exports.defineMiddleware = void 0;
const Application = __importStar(require("./Core/Application"));
const Controller_1 = __importDefault(require("./Core/Controller"));
const Model_1 = __importDefault(require("./Core/Model"));
const Service_1 = __importDefault(require("./Core/Service"));
/**
 * 声明中间件
 * @param func koa2中间件
 * @returns
 */
const defineMiddleware = function (func) {
    return func;
};
exports.defineMiddleware = defineMiddleware;
/**
 * 声明配置
 * @param func koa2中间件
 * @returns
 */
const defineConfig = function (cfg) {
    return cfg;
};
exports.defineConfig = defineConfig;
/**
 * 框架
 */
exports.Hpyer = Application;
/**
 * 控制器基类
 */
exports.Controller = Controller_1.default;
/**
 * 模型基类
 */
exports.Model = Model_1.default;
/**
 * 服务基类
 */
exports.Service = Service_1.default;
