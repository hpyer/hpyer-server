'use strict';

import { HpyerServerConfigDbQueryOption } from '../Support/Types/Hpyer';
import Application from './Application';

/**
 * 模型基类
 */
export default class Model {

  /**
   * 应用实例，框架会自动注入
   */
  app: Application = null;

  /**
   * 表名
   */
  table: string = '';

  constructor() {
    this.table = '';
  }

  /**
   * 执行sql语句
   * @param sql 要执行的sql语句
   * @param values sql的参数
   * @param fetch_last_id 是否获取自增id，默认：false
   */
  async execute(sql: string, values: object = null, fetch_last_id: boolean = false) {
    let db = this.app.getDB();
    if (!db) return null;
    let res = await db.execute(sql, values, fetch_last_id);
    db.disconnect();
    return res;
  }

  /**
   * execute 方法的别名
   * @param sql 要执行的sql语句
   * @param values sql的参数
   * @param fetch_last_id 是否获取自增id，默认：false
   */
  findSql(sql: string, values: object = null, fetch_last_id: boolean = false) {
    return this.execute(sql, values, fetch_last_id);
  }

  /**
   * 查询所有
   * @param where 查询条件
   * @param options 查询选项。若传字符串，则表示查询的字段
   */
  async findAll(where: object | Array<string | boolean> | string = null, options: HpyerServerConfigDbQueryOption | string = null) {
    let db = this.app.getDB();
    if (!db) return null;
    let res = await db.findAll(this.table, where, options);
    db.disconnect();
    return res;
  }

  /**
   * 查询单条
   * @param where 查询条件
   * @param options 查询选项。若传字符串，则表示查询的字段
   */
  async findOne(where: object | Array<string | boolean> | string = null, options: HpyerServerConfigDbQueryOption | string = null) {
    let db = this.app.getDB();
    if (!db) return null;
    let res = await db.findOne(this.table, where, options);
    db.disconnect();
    return res;
  }

  /**
   * 查询统计
   * @param where 查询条件
   * @param field 统计字段，默认：COUNT(1)
   */
  async findCount(where: object | Array<string | boolean> | string = null, field = 'COUNT(1)') {
    let db = this.app.getDB();
    if (!db) return 0;
    let res = await db.findCount(this.table, where, field);
    db.disconnect();
    return res;
  }

  /**
   * 新增记录
   * @param data 数据
   * @param fetch_last_id 是否获取自增id，默认：false
   */
  async create(data: object, fetch_last_id: boolean = false) {
    let db = this.app.getDB();
    if (!db) return false;
    let res = await db.create(this.table, data, fetch_last_id);
    db.disconnect();
    return res;
  }

  /**
   * 新增记录，create的别名
   * @param data 数据
   * @param fetch_last_id 是否获取自增id，默认：false
   */
  insert(data: object, fetch_last_id: boolean = false) {
    return this.create(data, fetch_last_id);
  }

  /**
   * 更新记录
   * @param data 要更新的数据
   * @param where 更新条件
   */
  async update(data: object, where: object | Array<string | boolean> | string = null) {
    let db = this.app.getDB();
    if (!db) return false;
    let res = await db.update(this.table, data, where);
    db.disconnect();
    return res;
  }

  /**
   * 删除记录
   * @param where 删除条件
   */
  async delete(where: object | Array<string | boolean> | string = null) {
    let db = this.app.getDB();
    if (!db) return false;
    let res = await db.delete(this.table, where);
    db.disconnect();
    return res;
  }

  /**
   * 字段自增数值
   * @param field 字段名
   * @param where 更新条件
   * @param qty 自增数量
   */
  async increase(field: string, where: object | Array<string | boolean> | string = null, qty: number = 1) {
    let db = this.app.getDB();
    if (!db) return false;
    let res = await db.increase(this.table, field, where, qty);
    db.disconnect();
    return res;
  }

  /**
   * 字段自减数值
   * @param field 字段名
   * @param where 更新条件
   * @param qty 自减数量
   */
  async discrease(field: string, where: object | Array<string | boolean> | string = null, qty: number = 1) {
    let db = this.app.getDB();
    if (!db) return false;
    let res = await db.discrease(this.table, field, where, qty);
    db.disconnect();
    return res;
  }

}
