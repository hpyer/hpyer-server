'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class ContractCache {
    /**
     * 获取缓存数据
     * @param name 缓存名
     */
    get(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return null;
        });
    }
    /**
     * 判断缓存是否存在
     * @param name 缓存名
     */
    has(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return true;
        });
    }
    /**
     * 设置缓存
     * @param name 缓存名
     * @param data 缓存值
     * @param expireIn 过期时间，单位：秒，默认：0表示不过期
     */
    set(name, data = null, expireIn = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            return true;
        });
    }
    /**
     * 删除缓存
     * @param name 缓存名
     */
    del(name) {
        return __awaiter(this, void 0, void 0, function* () {
            return true;
        });
    }
}
exports.default = ContractCache;
