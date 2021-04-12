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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const koa_send_1 = __importDefault(require("koa-send"));
const fs_1 = __importDefault(require("fs"));
const Utils = __importStar(require("../Support/Utils"));
const Application_1 = require("./Application");
/**
 * 控制器基类
 */
class Controller {
    constructor() {
        /**
         * 当前 module 名称，框架会自动注入
         */
        this.module = '';
        /**
         * 当前 controller 名称，框架会自动注入
         */
        this.controller = '';
        /**
         * 当前 action 名称，框架会自动注入
         */
        this.action = '';
        /**
         * 当前 koa 的请求上下文对象，框架会自动注入
         */
        this.ctx = null;
        /**
         * 是否 post 请求，框架会自动注入
         */
        this.isPost = false;
        /**
         * 是否命令行请求，框架会自动注入，无 koa 的请求上下文时为 true
         */
        this.isCli = false;
        this.module = '';
        this.controller = '';
        this.action = '';
        this.viewParams = {};
    }
    /**
     * 控制器的 action 在执行前的钩子
     */
    __before() {
        return true;
    }
    /**
     * 控制器的 action 在执行后的钩子
     */
    __after() {
        return true;
    }
    /**
     * 添加模版参数
     * @param  name 参数名
     * @param  value 参数值
     */
    assign(name, value) {
        if (name && Utils.isObject(name)) {
            for (let k in name) {
                this.viewParams[k] = name[k];
            }
        }
        else {
            this.viewParams[name] = value;
        }
    }
    /**
     * 输出内容
     * @param  content 内容
     * @param  type 参数值，mime类型，默认：text/html
     */
    displayContent(content, type = 'text/html') {
        this.ctx.type = type;
        this.ctx.body = content;
    }
    /**
     * 输出模版内容
     * @param  file 模版名称，默认：${module}/${viewDir}/${controller}/${action}.html
     * @param  params 参数，键值对
     */
    displayTemplate(file = null, params = null) {
        if (!file) {
            file = this.module + '/' + Application_1.config.defaultViewDir + '/' + this.controller + '/' + this.action + Application_1.config.template.tplExtention;
        }
        if (params) {
            params = Utils.extend({}, this.viewParams, params);
        }
        else {
            params = this.viewParams;
        }
        try {
            this.displayContent(Application_1.getTemplater().render(file, params));
        }
        catch (e) {
            Application_1.log.error(`Fail to render template '${file}'.`, e.message);
        }
        return;
    }
    /**
     * 输出当前应用的模版内容
     * @param  file 模版名称，默认：${controller}/${action}.html
     * @param  params 参数，键值对
     * @param  ext 参数，扩展名
     */
    display(file = null, params = null, ext = '') {
        if (!file) {
            file = this.controller + '/' + this.action + Application_1.config.template.tplExtention;
        }
        file = this.module + '/' + Application_1.config.defaultViewDir + '/' + file;
        if (ext) {
            if (ext.substr(0, 1) != '.') {
                ext = '.' + ext;
            }
            file += ext;
        }
        return this.displayTemplate(file, params);
    }
    /**
     * 输出json数据
     * @param  res json对象
     */
    json(res) {
        this.ctx.type = 'application/json';
        this.ctx.body = res;
    }
    /**
     * 强制为ajax请求
     */
    forceAjax() {
        this.ctx.request.is_ajax = true;
        return this;
    }
    /**
     * 判断当前是否ajax请求
     */
    isAjaxRequest() {
        return Application_1.utils.isAjaxRequest(this.ctx);
    }
    /**
     * 输出成功时的结果，ajax请求则输出json，否则输出html
     * @param  data 数据
     * @param  message 消息
     */
    success(data = '', message = 'ok') {
        if (this.isAjaxRequest()) {
            this.ctx.type = 'application/json';
            this.ctx.body = Utils.jsonSuccess(data, message);
        }
        else {
            this.displayContent(Application_1.getTemplater().renderError({
                success: true,
                message: message,
                code: '0',
                waitSecond: 0,
                jumpUrl: ''
            }));
            return false;
        }
    }
    /**
     * 输出失败时的结果，ajax请求则输出json，否则输出html
     * @param  message 错误信息
     * @param  code 错误代码
     * @param  data 数据
     */
    fail(message, code = '1', data = null) {
        if (this.isAjaxRequest()) {
            this.ctx.type = 'application/json';
            this.ctx.body = Utils.jsonError(message, code, data);
            return false;
        }
        else {
            this.displayContent(Application_1.getTemplater().renderError({
                success: false,
                message: message,
                code: code,
                waitSecond: 0,
                jumpUrl: ''
            }));
            return false;
        }
    }
    /**
     * 文件下载
     * @param  file 文件路径
     * @param  options { autoDelete: 是否自动删除文件，默认：true, root: 文件所在根目录 }
     */
    download(file, options = null) {
        return __awaiter(this, void 0, void 0, function* () {
            let opts = {
                autoDelete: true,
                root: '',
            };
            if (options && Utils.isObject(options)) {
                if (options.hasOwnProperty('autoDelete')) {
                    opts.autoDelete = options['autoDelete'] || true;
                }
                if (options.hasOwnProperty('root')) {
                    opts.root = options['root'] || '';
                }
            }
            let filename = '';
            filename = file;
            if (file.indexOf('/') > -1) {
                filename = file.substr(file.lastIndexOf('/') + 1);
            }
            this.ctx.attachment(filename);
            yield koa_send_1.default(this.ctx, file, {
                root: opts.root,
            });
            if (opts.autoDelete)
                fs_1.default.unlink(file, _ => { });
        });
    }
}
exports.default = Controller;
;
