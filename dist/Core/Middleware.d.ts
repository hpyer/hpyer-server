import { HpyerServerKoaMiddleware } from '../Support/Types/Hpyer';
/**
 * 中间件对象
 */
export default class Middleware {
    /**
     * 中间件处理方法
     */
    func: HpyerServerKoaMiddleware;
    constructor(func: HpyerServerKoaMiddleware);
    /**
     * 设置中间件处理方法
     * @param func 中间件处理方法
     */
    set(func: HpyerServerKoaMiddleware): void;
    /**
     * 获取中间件处理方法
     */
    get(): HpyerServerKoaMiddleware<import("../Support/Types/Hpyer").HpyerServerKoaState, import("../Support/Types/Hpyer").HpyerServerKoaContext>;
}
