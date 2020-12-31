import { Context, Request } from 'koa';
import Application from '../../Core/Application';

declare module 'koa' {
  /**
   * Koa上下文对象
   */
  export interface Context {
    /**
     * 应用实例
     */
    $app?: Application,
  }

  /**
   * Koa请求对象
   */
  export interface Request {
    /**
     * 是否ajax请求
     */
    is_ajax?: boolean,
    /**
     * 客户端ip
     */
    client_ip?: string,
    /**
     * query的数据
     */
    query?: object,
    /**
     * query的原始数据
     */
    query_raw?: object,
    /**
     * post的数据
     */
    post?: object,
    /**
     * post的原始数据
     */
    post_raw?: object,
  }
}
