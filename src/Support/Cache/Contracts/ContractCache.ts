'use strict';

export default class ContractCache {

  /**
   * 获取缓存数据
   * @param name 缓存名
   */
  async get(name: string): Promise<any> {
    return null;
  }

  /**
   * 判断缓存是否存在
   * @param name 缓存名
   */
  async has(name: string): Promise<boolean> {
    return true;
  }

  /**
   * 设置缓存
   * @param name 缓存名
   * @param data 缓存值
   * @param expireIn 过期时间，单位：秒，默认：0表示不过期
   */
  async set(name: string, data: any = null, expireIn: number = 0): Promise<boolean> {
    return true;
  }

  /**
   * 删除缓存
   * @param name 缓存名
   */
  async del(name: string): Promise<boolean> {
    return true;
  }

}
