'use strict';

import * as Utils from '../../Utils';
import { MysqlError, Pool, PoolConnection } from 'mysql';
import ContractSql from '../Contracts/ContractSql';
import { HpyerConfigDbQueryOption } from '../../Types/Hpyer';

const mysql = require('mysql');

export const DefaultQueryOptions: HpyerConfigDbQueryOption = {
  fields: '*',
  offset: 0,
  limit: 0,
  order: '',
  lock: false,
};

class ProviderMysql extends ContractSql {

  conn: PoolConnection = null;

  constructor(conn: PoolConnection) {
    super();

    this.conn = conn;
    // this.conn.on('error', (err) => {
    //    if (err.code === 'ETIMEDOUT') {
    //       this.conn.connect();
    //    }
    // });
  }


  escape (str: string | Array<string>): Array<string> | string {
    if (typeof str == 'object') {
      let arr = []
      for (let i in str) {
        arr[i] = this.escape(str[i]);
      }
      return arr;
    }
    else if (typeof str == 'string') {
      return `'${str.replace(/(\'|\")/i, '\\$1')}'`;
    }
    else {
      return str + '';
    }
  };

  parseWhereValue (k: string, v: string | Array<string>): string {
    if (Utils.isArray(v[1])) {
      // array eg. ['in', ['value1', 'value2', 'value3']]
      if (v[0].toLowerCase() == 'between') {
        return `\`${k}\` BETWEEN ${this.escape(v[1][0])} AND ${this.escape(v[1][1])}`;
      }
      else if (v[0].toLowerCase() == 'like') {
        let a = [];
        for (let i = 0; i < v[1].length; i++) {
          a.push(`\`${k}\` LIKE ${this.escape(v[1][i])}`);
        }
        return a.join(' OR ');
      }
      else {
        return `\`${k}\` ${v[0]} (${(this.escape(v[1]) as Array<string>).join(',')})`;
      }
    }
    else if (v[0] == 'exp') {
      // array eg. ['exp', sql]
      return `\`${k}\` ${v[1]}`;
    }
    else {
      // array eg. ['=', 'value'] or ['like', 'value%']
      return `\`${k}\` ${v[0]} (${this.escape(v[1])})`;
    }
  }

  parseWhereItem (k: string, v: string | Array<string | boolean>): string {
    k = k.replace(/\./, '`.`');
    if (Utils.isArray(v) && v.length == 2) {
      return ' AND ' + this.parseWhereValue(k, v as Array<string>);
    }
    else if (Utils.isArray(v) && v.length == 3) {
      // array eg. ['name', 'a', false] or ['name', ['in', ['a', 'b']], 'or']
      let is_and = !(v[2] === false || v[2] == 'OR' || v[2] == 'or');
      return (is_and ? ' AND ' : ' OR ') + this.parseWhereValue(k, v as Array<string>);
    }
    else {
      return ` AND \`${k}\`=${this.escape(v as string)}`;
    }
  }

  parseWhere (where: object | Array<string | boolean> | string): string {
    if (!where) return '';

    let whereStrings = [];
    if (Utils.isObject(where)) {
      for (let k in where as object) {
        let v = where[k];
        if (k.indexOf('|')) {
          // eg. {'name|account': 'test'}
          let is_and: boolean = true;
          if (Utils.isArray(v) && v.length == 3) {
            is_and = !(v[2] === false || v[2] == 'OR' || v[2] == 'or');
          }
          let ks = k.split('|');
          let items = [];
          for (let j = 0; j < ks.length; j++) {
            if (!ks[j]) continue;
            items.push(this.parseWhereItem(ks[j], v).replace(/^\s(AND|OR)\s/gi, ''));
          }
          whereStrings.push((is_and ? ' AND ' : ' OR ') + '(' + items.join(' OR ') + ')');
        }
        else if (k.indexOf('&')) {
          // eg. {'name&account': 'test'}
          let is_and: boolean = true;
          if (Utils.isArray(v) && v.length == 3) {
            is_and = !(v[2] === false || v[2] == 'OR' || v[2] == 'or');
          }
          let ks = k.split('&');
          let items = [];
          for (let j = 0; j < ks.length; j++) {
            if (!ks[j]) continue;
            items.push(this.parseWhereItem(ks[j], v).replace(/^\s(AND|OR)\s/gi, ''));
          }
          whereStrings.push((is_and ? ' AND ' : ' OR ') + '(' + items.join(' AND ') + ')');
        }
        else {
          whereStrings.push(this.parseWhereItem(k, v));
        }
      }
    }
    else if (Utils.isArray(where)) {
      // array eg. ['`name`=\'a\'', ['`name`=\'b\'', false], ['`status`=1', 'and']]
      for (let i = 0; i < (where as Array<string>).length; i++) {
        let v = where[i];
        if (Utils.isArray(v) && v.length == 2) {
          // array eg. ['`name`=\'b\'', false], ['`status`=1', 'and']
          let is_and = !(v[1] === false || v[1] == 'OR' || v[1] == 'or');
          whereStrings.push((is_and ? ' AND ' : ' OR ') + v[0]);
        }
        else {
          whereStrings.push(` AND ${v}`);
        }
      }
    }
    else {
      // string
      return ' WHERE ' + where;
    }
    if (whereStrings.length > 0) {
      return ' WHERE ' + whereStrings.join('').replace(/^\s(AND|OR)\s/gi, '');
    }
    return '';
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

  async execute(sql: string, values: object = null, fetch_last_id: boolean = false): Promise<any> {
    try {
      console.log('mysql.execute: ', sql, values);
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
      console.log('mysql.execute: ', e);
      throw new Error('mysql.execute: ' + e.message);
    }
    finally {
      await this.disconnect();
    }
  };

  async transaction (callback) {
    if (typeof callback != 'function') return false;
    let res = false;
    await this.startTrans();
    try {
      res = await callback(this);
    } catch (e) {
      console.log('mysql.transaction: ', e);
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
          console.log('mysql.startTrans: ', e);
          return reject(false);
        }
        console.log('mysql.startTrans');
        resolve(true);
      })
    });
  }

  commit(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.conn.commit((e) => {
        if (e) {
          console.log('mysql.commit: ', e);
          return reject(false);
        }
        console.log('mysql.commit');
        resolve(true);
      })
    });
  }

  rollback(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.conn.rollback((e) => {
        if (e) {
          console.log('mysql.rollback: ', e);
          return reject(false);
        }
        console.log('mysql.rollback');
        resolve(true);
      })
    });
  }

  findAll(table: string, where: object | Array<string | boolean> | string = null, options: HpyerConfigDbQueryOption = {}) {
    where = this.parseWhere(where);
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

  async findOne(table: string, where: object | Array<string | boolean> | string = null, options: HpyerConfigDbQueryOption = {}) {
    options.offset = 0;
    options.limit = 1;
    let rows = await this.findAll(table, where, options);
    if (!rows || !rows.length) {
      return false;
    }
    return rows[0];
  }

  async findCount(table: string, where: object | Array<string | boolean> | string = null, field: string = 'COUNT(0)') {
    let options: HpyerConfigDbQueryOption = {
      fields: field + ' AS qty',
    }
    let row = await this.findOne(table, where, options);
    if (!row) {
      return false;
    }
    return row.qty;
  }

  create(table: string, data: object, fetch_last_id: boolean = true): Promise<any> {
    let fields = [], values = [];
    for (let k in data) {
      fields.push('`' + k + '`');
      values.push(this.escape(data[k]));
    }
    let sql = `INSERT INTO ${table} (${fields.join(', ')}) VALUES (${values.join(', ')})`;
    return this.execute(sql, null, fetch_last_id);
  }

  replace(table: string, data: object): Promise<any> {
    let fields = [], values = [];
    for (let k in data) {
      fields.push('`' + k + '`');
      values.push(this.escape(data[k]));
    }
    let sql = `REPLACE INTO ${table} (${fields.join(', ')}) VALUES (${values.join(', ')})`;
    return this.execute(sql);
  }

  async update(table: string, data: object, where: object | Array<string | boolean> | string = null): Promise<boolean> {
    where = this.parseWhere(where);
    let dataArr = [];
    for (let k in data) {
      let v = '';
      if (Utils.isArray(data[k])) {
        if (data[k][0] == 'exp') {
          v = data[k][1];
        }
      }
      else {
        v = Utils.isNumber(data[k]) ? data[k] : this.escape(data[k]);
      }
      dataArr.push('`' + k + '`=' + v);
    }
    let sql = `UPDATE ${table} SET ${dataArr.join(',')}${where}`;
    let res = await this.execute(sql);
    return res ? true : false;
  }

  async delete(table: string, where: object | Array<string | boolean> | string = null): Promise<boolean> {
    where = this.parseWhere(where);
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

const getConnection = async function (options) {
  options = Utils.extend({
    host: '127.0.0.1',
    user: '',
    password: '',
    database: '',
    port: ''
  }, options);
  if (!pool) {
    pool = mysql.createPool(options);
  }

  let conn: PoolConnection = await (new Promise((resolve, reject) => {
    pool.getConnection((err: MysqlError, conn: PoolConnection) => {
      if (err) {
        console.log('mysql.connect fail. ' + options.user + '@' + options.host + '.' + options.database + ' [password:' + (options.password ? 'YES' : 'NO') + ']')
        reject(err);
      }
      else {
        resolve(conn);
      }
    });
  }))

  return new ProviderMysql(conn);
}

export default getConnection;
