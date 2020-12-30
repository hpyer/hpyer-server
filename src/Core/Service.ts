'use strict';

import * as Utils from '../Support/Utils';
import Application from './Application';

/**
 * 服务基类
 */
export default class Service {

  /**
   * 应用实例，框架会自动注入
   */
  $app: Application = null;

  constructor () {
  }

  /**
   * 返回成功时的结果
   * @param  {any} data 数据
   * @param  {string} message 消息
   * @return {object}
   */
  success (data: any = '', message: string = 'ok') {
    return Utils.jsonSuccess(data, message);
  }

  /**
   * 返回失败时的结果
   * @param  {string} message 错误信息
   * @param  {string} code 错误代码
   * @param  {any} data 数据
   * @return {object}
   */
  fail (message: string, code: string = '1', data: any = null) {
    return Utils.jsonError(message, code, data);
  }
};
