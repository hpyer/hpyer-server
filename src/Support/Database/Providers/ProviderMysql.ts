'use strict';

import * as Utils from '../../Utils';
import Logger from '../../Logger';
import { ConnectionConfig, MysqlError, Pool, PoolConnection } from 'mysql';
import ContractSql from '../Contracts/ContractSql';
import { HpyerServerConfigDbQueryOption } from '../../Types/hpyer';

const mysql = require('mysql');

export const DefaultQueryOptions: HpyerServerConfigDbQueryOption = {
  fields: '*',
  offset: 0,
  limit: 0,
  order: '',
  lock: false,
};

class ProviderMysql extends ContractSql {

  pool: Pool = null;
  conn: PoolConnection = null;
  options: ConnectionConfig = {};

  constructor(pool: Pool, options: ConnectionConfig) {
    super();

    this.pool = pool;
    this.options = options;
  }

  disconnect (): boolean {
    try {
      if (!this.conn) return true;
      this.conn.release();
      this.conn = null;
    }
    catch (e) {

    }
    return true;
  }

  getConnection(): Promise<PoolConnection> {
    return new Promise((resolve, reject) => {
      pool.getConnection((err: MysqlError, conn: PoolConnection) => {
        if (err) {
          Logger.error('mysql.connect fail. ' + this.options.user + '@' + this.options.host + '.' + this.options.database + ' [password:' + (this.options.password ? 'YES' : 'NO') + ']')
          reject(err);
        }
        else {
          resolve(conn);
        }
      });
    });
  }

  async execute(sql: string, values: object = null, fetch_last_id: boolean = false): Promise<any> {
    try {
      if (!this.conn) {
        this.conn = await this.getConnection();
      }
      Logger.info('mysql.execute: ', sql, values);
      return new Promise((resolve, reject) => {
        let callback = (e, results: any, fields) => {
          if (e) return reject(e);
          if (fetch_last_id && (/^INSERT/ig).test(sql)) {
            this.conn.query('SELECT last_insert_id() AS id', (e1, results1) => {
              if (e1) return reject(e1);
              let last_insert_id = results1 && results1[0] && results1[0].id ? results1[0].id : 0;
              resolve(last_insert_id as number);
            });
          }
          else {
            resolve(results);
          }
        };
        if (values && typeof values == 'object') {
          this.conn.query(sql, values, callback);
        }
        else {
          this.conn.query(sql, callback);
        }
      });
    }
    catch (e) {
      Logger.error('mysql.execute: ', e);
      throw new Error('mysql.execute: ' + e.message);
    }
  };

  async transaction(closure: Function): Promise<any> {
    if (!Utils.isFunction(closure)) return false;
    let res = false;
    await this.startTrans();
    try {
      res = await closure(this);
    } catch (e) {
      Logger.error('mysql.transaction: ', e);
      res = false;
    }
    if (res === false) {
      await this.rollback();
    }
    else {
      await this.commit();
    }
    return res;
  }

  startTrans (): Promise<any> {
    return new Promise((resolve, reject) => {
      this.conn.beginTransaction((e: MysqlError) => {
        if (e) {
          Logger.error('mysql.startTrans: ', e);
          return reject(false);
        }
        Logger.info('mysql.startTrans');
        resolve(true);
      })
    });
  }

  commit(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.conn.commit((e) => {
        if (e) {
          Logger.error('mysql.commit: ', e);
          return reject(false);
        }
        Logger.info('mysql.commit');
        resolve(true);
      })
    });
  }

  rollback(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.conn.rollback((e) => {
        if (e) {
          Logger.error('mysql.rollback: ', e);
          return reject(false);
        }
        Logger.info('mysql.rollback');
        resolve(true);
      })
    });
  }

  findAll(table: string, where: object | Array<string | boolean> | string = null, options: HpyerServerConfigDbQueryOption | string = {}) {
    where = Utils.parseWhere(where);
    options = options || {};
    if (typeof options === 'string') {
      options = {
        fields: options,
      };
    }
    options = Utils.extend({}, DefaultQueryOptions, options);
    let limit = '', order = '';
    if (options.limit > 0) {
      limit = ` LIMIT ${options.offset},${options.limit}`;
    }
    if (options.order) {
      order = ` ORDER BY ${options.order}`;
    }
    let sql = `SELECT ${options.fields} FROM ${table}${where}${order}${limit}`;
    if (options.lock) {
      sql += ' FOR UPDATE';
    }
    return this.execute(sql);
  }

  async findOne(table: string, where: object | Array<string | boolean> | string = null, options: HpyerServerConfigDbQueryOption | string = {}) {
    options = options || {};
    if (typeof options === 'string') {
      options = {
        fields: options,
      };
    }
    options.offset = 0;
    options.limit = 1;
    let rows = await this.findAll(table, where, options);
    if (!rows || !rows.length) {
      return false;
    }
    return rows[0];
  }

  async findCount(table: string, where: object | Array<string | boolean> | string = null, field: string = 'COUNT(1)') {
    let row = await this.findOne(table, where, field + ' AS qty');
    if (!row) {
      return false;
    }
    return row.qty;
  }

  create(table: string, data: object, fetch_last_id: boolean = true): Promise<any> {
    let fields = [], values = [];
    for (let k in data) {
      fields.push('`' + k + '`');
      values.push(Utils.sqlEscape(data[k]));
    }
    let sql = `INSERT INTO ${table} (${fields.join(', ')}) VALUES (${values.join(', ')})`;
    return this.execute(sql, null, fetch_last_id);
  }

  replace(table: string, data: object): Promise<any> {
    let fields = [], values = [];
    for (let k in data) {
      fields.push('`' + k + '`');
      values.push(Utils.sqlEscape(data[k]));
    }
    let sql = `REPLACE INTO ${table} (${fields.join(', ')}) VALUES (${values.join(', ')})`;
    return this.execute(sql);
  }

  async update(table: string, data: object, where: object | Array<string | boolean> | string = null): Promise<boolean> {
    where = Utils.parseWhere(where);
    let dataArr = [];
    for (let k in data) {
      let v = '';
      if (Utils.isArray(data[k])) {
        if (data[k][0] == 'exp') {
          v = data[k][1];
        }
      }
      else {
        v = Utils.isNumber(data[k]) ? data[k] : Utils.sqlEscape(data[k]);
      }
      dataArr.push('`' + k + '`=' + v);
    }
    let sql = `UPDATE ${table} SET ${dataArr.join(',')}${where}`;
    let res = await this.execute(sql);
    return res ? true : false;
  }

  async delete(table: string, where: object | Array<string | boolean> | string = null): Promise<boolean> {
    where = Utils.parseWhere(where);
    let sql = `DELETE FROM ${table}${where}`;
    let res = await this.execute(sql);
    return res ? true : false;
  }

  increase(table: string, field: string, where: object | Array<string | boolean> | string = null, qty: number = 1): Promise<boolean> {
    let data = {};
    data[field] = ['exp', field + '+' + qty];
    return this.update(table, data, where);
  }

  discrease(table: string, field: string, where: object | Array<string | boolean> | string = null, qty: number = 1): Promise<boolean> {
    let data = {};
    data[field] = ['exp', field + '-' + qty];
    return this.update(table, data, where);
  }
}


let pool: Pool = null;

const getDbInstance = function (options: ConnectionConfig) {
  if (!pool) {
    pool = mysql.createPool(options);
  }

  return new ProviderMysql(pool, options);
}

export default getDbInstance;
