'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
class ContractSql {
    /**
     * 断开链接
     */
    disconnect() { }
    /**
     * 获取连接
     */
    getConnection() { }
    /**
     * 执行sql语句
     * @param sql 要执行的sql语句
     * @param values sql的参数
     * @param fetch_last_id 是否获取自增id，默认：false
     */
    execute(sql, values, fetch_last_id = false) {
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
     * @param field 统计字段，默认：COUNT(1)
     */
    findCount(table, where, field) {
        return null;
    }
    /**
     * 新增记录
     * @param table 表名
     * @param data 数据
     * @param fetch_last_id 是否获取自增id，默认：false
     */
    create(table, data, fetch_last_id = false) {
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
     * 执行事务，执行完后自动提交或回滚
     * @param closure 要执行的闭包。该闭包需要接收一个 db 实例对象，以完成事务相关操作。闭包返回 false 表示需要回滚，返回其他则表示提交。
     * @return 闭包的返回值也是 transaction 返回值
     */
    transaction(closure) {
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
