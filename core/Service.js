'use strict';

module.exports = class {
  constructor () {
  }

  /**
   * 返回成功时的结果
   * @param  {any} data 数据
   * @param  {string} message 消息
   * @return {object}
   */
  success (data = '', message = 'ok') {
    return Hpyer.jsonSuccess(data, message);
  }

  /**
   * 返回失败时的结果
   * @param  {string} message 错误信息
   * @param  {string} code 错误代码
   * @param  {any} data 数据
   * @return {object}
   */
  fail (message, code = 1, data = null) {
    return Hpyer.jsonError(message, code, data);
  }
};
