'use strict';

const Templater = require('./Templater');

module.exports = class {
  constructor () {
    this.app = '';
    this.controller = '';
    this.action = '';
    this.viewParams = {};
  }

  /**
   * 添加模版参数
   * @param  string  name  参数名
   * @param  [mixed]  value  参数值
   * @return void
   */
  assign (name, value) {
    if (name && Hpyer.isObject(name)) {
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
   * @param  string  content  内容
   * @param  string  type  参数值，mime类型，默认：text/html
   * @return void
   */
  displayContent (content, type = 'text/html') {
    this.ctx.type = type;
    this.ctx.body = content;
  }

  /**
   * 输出模版内容
   * @param  string  file  模版名称，默认：${app}/${viewDir}/${controller}/${action}.html
   * @param  object  params  参数，键值对
   * @return void
   */
  display (file = null, params = null) {
    if (!file) {
      file = this.app + '/' + Hpyer.config.defaultViewDir + '/' + this.controller + '/' + this.action + '.html';
    }
    if (params) {
      params = Hpyer.extend({}, this.viewParams, params);
    }
    else {
      params = this.viewParams;
    }
    try {
      this.displayContent(Templater.render(file, params));
    }
    catch (e) {
      console.log('The template file `' + file + '` not found.', e);
    }
    return;
  }

  /**
   * 输出json数据
   * @param  object  res  json对象
   * @return void
   */
  json (res) {
    this.ctx.type = 'application/json';
    this.ctx.body = res;
  }

  /**
   * 输出成功时的结果，ajax请求则输出json，否则输出html
   * @param  [mixed]  data  数据
   * @param  string  message  消息
   * @return void
   */
  success (data = '', message = 'ok') {
    if (this.isAjax()) {
      this.ctx.type = 'application/json';
      this.ctx.body = Hpyer.jsonSuccess(data, message);
    }
    else {
      this.displayContent(Templater.renderError({
        success: true,
        message: message,
        code: 0,
        waitSecond: 0,
        jumpUrl: ''
      }));
      return false;
    }
  }

  /**
   * 输出失败时的结果，ajax请求则输出json，否则输出html
   * @param  string  message  错误信息
   * @param  string/integer  code  错误代码
   * @param  [mixed]  data  数据
   * @return false 为了阻止
   */
  fail (message, code = 1, data = null) {
    if (this.isAjax()) {
      this.ctx.type = 'application/json';
      this.ctx.body = Hpyer.jsonError(message, code, data);
      return false;
    }
    else {
      this.displayContent(Templater.renderError({
        success: false,
        message: message,
        code: code,
        waitSecond: 0,
        jumpUrl: ''
      }));
      return false;
    }
  }
};
