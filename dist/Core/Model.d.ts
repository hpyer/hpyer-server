import { HpyerServerConfigDbQueryOption } from '../Support/Types/Hpyer';
import Application from './Application';
export default class Model {
    /**
     * 应用实例，框架会自动注入
     */
    app: Application;
    /**
     * 表名
     */
    table: string;
    constructor();
    /**
     * 执行sql语句
     * @param sql 要执行的sql语句
     * @param values sql的参数
     * @param fetch_last_id 是否获取自增id
     */
    execute(sql: string, values?: object, fetch_last_id?: boolean): Promise<any>;
    /**
     * execute 方法的别名
     * @param sql 要执行的sql语句
     * @param values sql的参数
     * @param fetch_last_id 是否获取自增id
     */
    findSql(sql: string, values?: object, fetch_last_id?: boolean): Promise<any>;
    /**
     * 查询所有
     * @param where 查询条件
     * @param options 查询选项
     */
    findAll(where?: object | Array<string | boolean> | string, options?: HpyerServerConfigDbQueryOption): Promise<any>;
    /**
     * 查询单条
     * @param where 查询条件
     * @param options 查询选项
     */
    findOne(where?: object | Array<string | boolean> | string, options?: HpyerServerConfigDbQueryOption): Promise<any>;
    /**
     * 查询统计
     * @param where 查询条件
     * @param field 统计字段，默认：COUNT(0)
     */
    findCount(where?: object | Array<string | boolean> | string, field?: string): Promise<number>;
    /**
     * 新增记录
     * @param data 数据
     * @param fetch_last_id 是否获取自增id，默认：false
     */
    create(data: object, fetch_last_id?: boolean): Promise<any>;
    /**
     * 新增记录，create的别名
     * @param data 数据
     * @param fetch_last_id 是否获取自增id，默认：false
     */
    insert(data: object, fetch_last_id?: boolean): Promise<any>;
    /**
     * 更新记录
     * @param data 要更新的数据
     * @param where 更新条件
     */
    update(data: object, where?: object | Array<string | boolean> | string): Promise<any>;
    /**
     * 删除记录
     * @param where 删除条件
     */
    delete(where?: object | Array<string | boolean> | string): Promise<any>;
    /**
     * 字段自增数值
     * @param field 字段名
     * @param where 更新条件
     * @param qty 自增数量
     */
    increase(field: string, where?: object | Array<string | boolean> | string, qty?: number): Promise<any>;
    /**
     * 字段自减数值
     * @param field 字段名
     * @param where 更新条件
     * @param qty 自减数量
     */
    discrease(field: string, where?: object | Array<string | boolean> | string, qty?: number): Promise<any>;
}
