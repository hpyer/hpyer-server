'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nunjucks_1 = __importDefault(require("nunjucks"));
const path_1 = __importDefault(require("path"));
const hpyer_1 = require("../Support/Types/hpyer");
/**
 * 框架模版
 */
class Templater {
    constructor(app) {
        this.app = null;
        this.provider = '';
        this.app = app;
        this.provider = app.config.template.provider || hpyer_1.HpyerTemplateProvider.NUNJUCKS;
    }
    /**
     * 设置模版提供商
     * @param {string} provider 模版提供商
     * @retur Templater
     */
    setProvider(provider) {
        this.provider = provider;
        return this;
    }
    /**
     * 渲染页面
     * @param args
     */
    render(...args) {
        let content = '';
        switch (this.provider) {
            case hpyer_1.HpyerTemplateProvider.NUNJUCKS:
            default:
                nunjucks_1.default.configure(path_1.default.resolve(this.app.config.root.modules), this.app.config.template.nunjucks);
                content = nunjucks_1.default.render.apply(this, args);
        }
        return content;
    }
    /**
     * 渲染错误页面
     * @param {object} opt
     */
    renderError(opt = null) {
        let content = '';
        switch (this.provider) {
            case hpyer_1.HpyerTemplateProvider.NUNJUCKS:
            default:
                nunjucks_1.default.configure(path_1.default.resolve(this.app.config.root.errors), this.app.config.template.nunjucks);
                content = nunjucks_1.default.render(this.app.config.template.defaultMessageTpl, opt);
        }
        return content;
    }
}
exports.default = Templater;
;
