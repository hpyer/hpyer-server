'use strict';
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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const Utils = __importStar(require("../Support/Utils"));
/**
 * 服务基类
 */
class Service {
    constructor() {
        /**
         * 应用实例，框架会自动注入
         */
        this.app = null;
    }
    /**
     * 返回成功时的结果
     * @param  {any} data 数据
     * @param  {string} message 消息
     * @return {object}
     */
    success(data = '', message = 'ok') {
        return Utils.jsonSuccess(data, message);
    }
    /**
     * 返回失败时的结果
     * @param  {string} message 错误信息
     * @param  {string} code 错误代码
     * @param  {any} data 数据
     * @return {object}
     */
    fail(message, code = '1', data = null) {
        return Utils.jsonError(message, code, data);
    }
}
exports.default = Service;
;
