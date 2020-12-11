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
Object.defineProperty(exports, "__esModule", { value: true });
const Utils = __importStar(require("./Utils"));
/**
 * 框架配置对象
 */
class Config {
    constructor(options = null) {
        /**
         * 服务端口
         */
        this.port = null;
        /**
         * 加密密钥
         */
        this.key = null;
        /**
         * 运行环境，可自定义。如：develop / test / production
         */
        this.env = null;
        /**
         * 默认 model 目录名
         */
        this.defaultModelDir = null;
        /**
         * 默认 controller 目录名
         */
        this.defaultControllerDir = null;
        /**
         * 默认 view 目录名
         */
        this.defaultViewDir = null;
        /**
         * 默认 module 名
         */
        this.defaultModuleName = null;
        /**
         * 默认 controller 名
         */
        this.defaultControllerName = null;
        /**
         * 默认 action 名
         */
        this.defaultActionName = null;
        /**
         * 各主要目录
         */
        this.root = null;
        /**
         * redis 唯一id相关配置
         */
        this.uniqueId = null;
        /**
         * koa 相关配置
         */
        this.koa = null;
        /**
         * 数据库相关配置
         */
        this.db = null;
        /**
         * 缓存相关配置
         */
        this.cache = null;
        /**
         * 模版相关选项
         */
        this.template = null;
        if (options)
            for (let k in options) {
                if (options[k] === null)
                    continue;
                if (Utils.isObject(options[k])) {
                    this[k] = Utils.extend({}, options[k]);
                }
                else if (Utils.isArray(options[k])) {
                    this[k] = Utils.extend([], options[k]);
                }
                else {
                    this[k] = options[k];
                }
            }
    }
}
exports.default = Config;
;
