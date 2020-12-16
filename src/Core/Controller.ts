'use strict';

import KoaSend from 'koa-send';
import Fs from 'fs';
import * as Utils from '../Support/Utils';
import Templater from './Templater';
import { HashMap } from '../Support/Types/hpyer';
import { Context } from 'koa';
import Application from './Application';

/**
 * 控制器基类
 */
export default class Controller {

  /**
   * 应用实例，框架会自动注入
   */
  app: Application = null;
  /**
   * 当前 module 名称，框架会自动注入
   */
  module: string = '';
  /**
   * 当前 controller 名称，框架会自动注入
   */
  controller: string = '';
  /**
   * 当前 action 名称，框架会自动注入
   */
  action: string = '';
  /**
   * 当前 koa 的请求上下文对象，框架会自动注入
   */
  ctx: Context = null;

  /**
   * 是否 post 请求，框架会自动注入
   */
  isPost: Boolean = false;

  /**
   * 是否命令行请求，框架会自动注入，无 koa 的请求上下文时为 true
   */
  isCli: Boolean = false;

  viewParams: HashMap;

  constructor() {
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
   * @param  {string} name 参数名
   * @param  {any} value 参数值
   * @return {void}
   */
  assign(name: string | object, value: string) {
    if (name && Utils.isObject(name)) {
      for (let k in name as object) {
        this.viewParams[k] = name[k];
      }
    }
    else {
      this.viewParams[name as string] = value;
    }
  }

  /**
   * 输出内容
   * @param  {string} content 内容
   * @param  {string} type 参数值，mime类型，默认：text/html
   * @return {void}
   */
  displayContent(content: string, type: string = 'text/html') {
    this.ctx.type = type;
    this.ctx.body = content;
  }

  /**
   * 输出模版内容
   * @param  {string} file 模版名称，默认：${module}/${viewDir}/${controller}/${action}.html
   * @param  {object} params 参数，键值对
   * @return {void}
   */
  displayTemplate(file: string = null, params: object = null) {
    if (!file) {
      file = this.module + '/' + this.app.config.defaultViewDir + '/' + this.controller + '/' + this.action + this.app.config.template.tplExtention;
    }
    if (params) {
      params = Utils.extend({}, this.viewParams, params);
    }
    else {
      params = this.viewParams;
    }
    try {
      this.displayContent((new Templater(this.app)).render(file, params));
    }
    catch (e) {
      this.app.log.error(`Fail to render template '${file}'.`, e.message);
    }
    return;
  }

  /**
   * 输出当前应用的模版内容
   * @param  {string} file 模版名称，默认：${controller}/${action}.html
   * @param  {object} params 参数，键值对
   * @param  {string} ext 参数，扩展名
   * @return {void}
   */
  display(file: string = null, params: object = null, ext: string = '') {
    if (!file) {
      file = this.controller + '/' + this.action + this.app.config.template.tplExtention;
    }
    file = this.module + '/' + this.app.config.defaultViewDir + '/' + file;
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
   * @param  {object} res json对象
   * @return {void}
   */
  json(res: object) {
    this.ctx.type = 'application/json';
    this.ctx.body = res;
  }

  forceAjax() {
    this.ctx.isAjax = true;
    return this;
  }

  isAjax() {
    if (this.ctx.isAjax || (this.ctx.request.header['x-requested-with'] && this.ctx.request.header['x-requested-with'] == 'XMLHttpRequest')) {
      return true;
    }
    return false;
  }

  /**
   * 输出成功时的结果，ajax请求则输出json，否则输出html
   * @param  {any} data 数据
   * @param  {string} message 消息
   * @return {void}
   */
  success(data: any = '', message: string = 'ok') {
    if (this.isAjax()) {
      this.ctx.type = 'application/json';
      this.ctx.body = Utils.jsonSuccess(data, message);
    }
    else {
      this.displayContent((new Templater(this.app)).renderError({
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
   * @param  {string} message 错误信息
   * @param  {string} code 错误代码
   * @param  {any} data 数据
   * @return {boolean} false表示不再继续执行
   */
  fail(message: string, code: string = '1', data: any = null) {
    if (this.isAjax()) {
      this.ctx.type = 'application/json';
      this.ctx.body = Utils.jsonError(message, code, data);
      return false;
    }
    else {
      this.displayContent((new Templater(this.app)).renderError({
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
   * @param  {string} file 文件路径
   * @param  {object} options { autoDelete: 是否自动删除文件，默认：true, root: 文件所在根目录 }
   * @return {void}
   */
  async download(file: string, options: object = null) {
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
    await KoaSend(this.ctx, file, {
      root: opts.root,
    });
    if (opts.autoDelete) Fs.unlink(file, _ => { });
  }

};
