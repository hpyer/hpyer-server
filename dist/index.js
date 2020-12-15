"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HpyerConfig = exports.HpyerService = exports.HpyerModel = exports.HpyerController = exports.HpyerApplication = void 0;
const Application_1 = __importDefault(require("./Core/Application"));
const Controller_1 = __importDefault(require("./Core/Controller"));
const Model_1 = __importDefault(require("./Core/Model"));
const Service_1 = __importDefault(require("./Core/Service"));
const Config_1 = __importDefault(require("./Support/Config"));
/**
 * 框架
 */
exports.HpyerApplication = Application_1.default;
/**
 * 控制器基类
 */
exports.HpyerController = Controller_1.default;
/**
 * 模型基类
 */
exports.HpyerModel = Model_1.default;
/**
 * 服务基类
 */
exports.HpyerService = Service_1.default;
/**
 * 配置基类
 */
exports.HpyerConfig = Config_1.default;
