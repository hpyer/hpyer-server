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
class Model {
    constructor() {
        /**
         * 应用实例，框架会自动注入
         */
        this.app = null;
        /**
         * 表名
         */
        this.table = '';
        this.table = '';
    }
    /**
     * 执行sql语句
     * @param sql 要执行的sql语句
     * @param values sql的参数
     * @param fetch_last_id 是否获取自增id
     */
    execute(sql, values = null, fetch_last_id = false) {
        return __awaiter(this, void 0, void 0, function* () {
            let db = yield this.app.getDB();
            if (!db)
                return null;
            let res = yield db.execute(sql, values, fetch_last_id);
            db.disconnect();
            return res;
        });
    }
    /**
     * execute 方法的别名
     * @param sql 要执行的sql语句
     * @param values sql的参数
     * @param fetch_last_id 是否获取自增id
     */
    findSql(sql, values = null, fetch_last_id = false) {
        return this.execute(sql, values, fetch_last_id);
    }
    /**
     * 查询所有
     * @param where 查询条件
     * @param options 查询选项
     */
    findAll(where = null, options = null) {
        return __awaiter(this, void 0, void 0, function* () {
            let db = yield this.app.getDB();
            if (!db)
                return null;
            let res = yield db.findAll(this.table, where, options);
            db.disconnect();
            return res;
        });
    }
    /**
     * 查询单条
     * @param where 查询条件
     * @param options 查询选项
     */
    findOne(where = null, options = null) {
        return __awaiter(this, void 0, void 0, function* () {
            let db = yield this.app.getDB();
            if (!db)
                return null;
            let res = yield db.findOne(this.table, where, options);
            db.disconnect();
            return res;
        });
    }
    /**
     * 查询统计
     * @param where 查询条件
     * @param field 统计字段，默认：COUNT(0)
     */
    findCount(where = null, field = 'COUNT(0)') {
        return __awaiter(this, void 0, void 0, function* () {
            let db = yield this.app.getDB();
            if (!db)
                return 0;
            let res = yield db.findCount(this.table, where, field);
            db.disconnect();
            return res;
        });
    }
    /**
     * 新增记录
     * @param data 数据
     * @param fetch_last_id 是否获取自增id，默认：false
     */
    create(data, fetch_last_id = false) {
        return __awaiter(this, void 0, void 0, function* () {
            let db = yield this.app.getDB();
            if (!db)
                return false;
            let res = yield db.create(this.table, data, fetch_last_id);
            db.disconnect();
            return res;
        });
    }
    /**
     * 新增记录，create的别名
     * @param data 数据
     * @param fetch_last_id 是否获取自增id，默认：false
     */
    insert(data, fetch_last_id = false) {
        return this.create(data, fetch_last_id);
    }
    /**
     * 更新记录
     * @param data 要更新的数据
     * @param where 更新条件
     */
    update(data, where = null) {
        return __awaiter(this, void 0, void 0, function* () {
            let db = yield this.app.getDB();
            if (!db)
                return false;
            let res = yield db.update(this.table, data, where);
            db.disconnect();
            return res;
        });
    }
    /**
     * 删除记录
     * @param where 删除条件
     */
    delete(where = null) {
        return __awaiter(this, void 0, void 0, function* () {
            let db = yield this.app.getDB();
            if (!db)
                return false;
            let res = yield db.delete(this.table, where);
            db.disconnect();
            return res;
        });
    }
    /**
     * 字段自增数值
     * @param field 字段名
     * @param where 更新条件
     * @param qty 自增数量
     */
    increase(field, where = null, qty = 1) {
        return __awaiter(this, void 0, void 0, function* () {
            let db = yield this.app.getDB();
            if (!db)
                return false;
            let res = yield db.increase(this.table, field, where, qty);
            db.disconnect();
            return res;
        });
    }
    /**
     * 字段自减数值
     * @param field 字段名
     * @param where 更新条件
     * @param qty 自减数量
     */
    discrease(field, where = null, qty = 1) {
        return __awaiter(this, void 0, void 0, function* () {
            let db = yield this.app.getDB();
            if (!db)
                return false;
            let res = yield db.discrease(this.table, field, where, qty);
            db.disconnect();
            return res;
        });
    }
}
exports.default = Model;
