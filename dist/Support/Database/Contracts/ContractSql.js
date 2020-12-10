'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
class ContractSql {
    /**
     * 断开链接
     */
    disconnect() { }
    /**
     * 执行sql语句
     * @param sql 要执行的sql语句
     * @param values sql的参数
     * @param fetch_last_id 是否获取自增id
     */
    execute(sql, values, fetch_last_id) {
        return null;
    }
    /**
     * 查询所有
     * @param table 表名
     * @param where 查询条件
     * @param options 查询选项
     */
    findAll(table, where, options) {
        return null;
    }
    /**
     * 查询单条
     * @param table 表名
     * @param where 查询条件
     * @param options 查询选项
     */
    findOne(table, where, options) {
        return null;
    }
    /**
     * 查询统计
     * @param table 表名
     * @param where 查询条件
     * @param field 统计字段
     */
    findCount(table, where, field) {
        return null;
    }
    /**
     * 新增记录
     * @param table 表名
     * @param data 数据
     * @param fetch_last_id 是否获取自增id
     */
    create(table, data, fetch_last_id) {
        return null;
    }
    /**
     * 替换记录
     * @param table 表名
     * @param data 数据
     */
    replace(table, data) {
        return null;
    }
    /**
     * 更新记录
     * @param table 表名
     * @param data 要更新的数据
     * @param where 更新条件
     */
    update(table, data, where) {
        return null;
    }
    /**
     * 删除记录
     * @param table 表名
     * @param where 删除条件
     */
    delete(table, where) {
        return null;
    }
    /**
     * 字段自增数值
     * @param table 表名
     * @param field 字段名
     * @param where 更新条件
     * @param qty 自增数量
     */
    increase(table, field, where, qty) {
        return null;
    }
    /**
     * 字段自减数值
     * @param table 表名
     * @param field 字段名
     * @param where 更新条件
     * @param qty 自减数量
     */
    discrease(table, field, where, qty) {
        return null;
    }
    /**
     * 开始事务
     */
    startTrans() {
        return null;
    }
    /**
     * 提交事务
     */
    commit() {
        return null;
    }
    /**
     * 回滚事务
     */
    rollback() {
        return null;
    }
}
exports.default = ContractSql;
