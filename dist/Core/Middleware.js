'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 中间件对象
 */
class Middleware {
    constructor(func) {
        /**
         * 中间件处理方法
         */
        this.func = null;
        this.set(func);
    }
    /**
     * 设置中间件处理方法
     * @param func 中间件处理方法
     */
    set(func) {
        this.func = func;
    }
    /**
     * 获取中间件处理方法
     */
    get() {
        return this.func;
    }
}
exports.default = Middleware;
