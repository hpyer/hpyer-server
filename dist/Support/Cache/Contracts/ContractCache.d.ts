export default class ContractCache {
    /**
     * 获取缓存数据
     * @param name 缓存名
     */
    get(name: string): Promise<any>;
    /**
     * 判断缓存是否存在
     * @param name 缓存名
     */
    has(name: string): Promise<boolean>;
    /**
     * 设置缓存
     * @param name 缓存名
     * @param data 缓存值
     * @param expireIn 过期时间，单位：秒，默认：0表示不过期
     */
    set(name: string, data?: any, expireIn?: number): Promise<boolean>;
    /**
     * 删除缓存
     * @param name 缓存名
     */
    del(name: string): Promise<boolean>;
}
