'use strict';

import { HpyerServerKoaMiddleware } from '../Support/Types/Hpyer';

/**
 * 中间件对象
 */
export default class Middleware {

  /**
   * 中间件处理方法
   */
  func: HpyerServerKoaMiddleware = null;

  constructor(func: HpyerServerKoaMiddleware) {
    this.set(func);
  }

  /**
   * 设置中间件处理方法
   * @param func 中间件处理方法
   */
  set(func: HpyerServerKoaMiddleware) {
    this.func = func;
  }

  /**
   * 获取中间件处理方法
   */
  get() {
    return this.func;
  }
}
