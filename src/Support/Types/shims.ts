import { Request } from 'koa';

declare module 'koa' {
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
