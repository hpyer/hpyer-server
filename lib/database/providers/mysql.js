'use strict';

const Utils = require(__dirname + '/../libs/Utils');
const InterfaceSql = require(__dirname + '/../interfaces/sql');
const mysql = require('mysql');

class ProviderMysql extends InterfaceSql {
  constructor (conn) {
    super();

    this.conn = conn;
    // this.conn.on('error', (err) => {
    //    if (err.code === 'ETIMEDOUT') {
    //       this.conn.connect();
    //    }
    // });
  }

  disconnect () {
    try {
      if (!this.conn) return true;
      this.conn.release();
      this.conn = null;
    }
    catch (e) {}
  }

  async execute (sql, values = null, fetch_last_id = false) {
    try {
      console.log('mysql.execute: ', sql, values);
      return new Promise((resolve, reject) => {
        let callback = (e, results, fields) => {
          if (e) return reject(e);
          if (fetch_last_id && (/^INSERT/ig).test(sql)) {
            this.conn.query('SELECT last_insert_id() AS id', (e1, results1) => {
              if (e1) return reject(e1);
              let last_insert_id = results1 && results1[0] && results1[0].id ? results1[0].id : 0;
              resolve(last_insert_id);
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
      throw new Error('mysql.execute: ' + e.message, 1);
      return false;
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

  async startTrans () {
    return await new Promise((resolve, reject) => {
      this.conn.beginTransaction((e) => {
        if (e) {
          console.log('mysql.startTrans: ', e);
          return reject(false);
        }
        console.log('mysql.startTrans');
        resolve(true);
      })
    });
  }

  async commit () {
    return await new Promise((resolve, reject) => {
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

  async rollback () {
    return await new Promise((resolve, reject) => {
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

  async findAll (table, where = null, fields = '*', page = 0, page_size = 0, order = '', isLock = false) {
    where = Utils.parseWhere(where);
    let limit = ''
    if (Utils.isString(page) && !Utils.isNumberString(page)) {
      let tmp_order = page;
      page = page_size;
      page_size = order;
      order = tmp_order;
      delete tmp_order;
    }
    if (page > 0 && page_size > 0) {
      let start = (page - 1) * page_size;
      limit = ` LIMIT ${start},${page_size}`;
    }
    if (order) {
      order = ` ORDER BY ${order}`;
    }
    let sql = `SELECT ${fields} FROM ${table}${where}${order}${limit}`;
    if (isLock) {
      sql += ' FOR UPDATE';
    }
    return await this.execute(sql);
  }

  async findOne (table, where = null, fields = '*', order = '', isLock = false) {
    let rows = await this.findAll(table, where, fields, 1, 1, order, isLock);
    if (!rows || !rows.length) {
      return false;
    }
    return rows[0];
  }

  async findCount (table, where = null, field = 'COUNT(0)') {
    let row = await this.findOne(table, where, field + ' AS qty');
    if (!row) {
      return false;
    }
    return row.qty;
  }

  async create (table, data, fetch_last_id = true) {
    let fields = [], values = [];
    for (let k in data) {
      fields.push('`' + k + '`');
      values.push(mysql.escape(data[k]));
    }
    fields = fields.join(', ');
    values = values.join(', ');
    let sql = `INSERT INTO ${table} (${fields}) VALUES (${values})`;
    return await this.execute(sql, null, fetch_last_id);
  }

  async replace (table, data) {
    let fields = [], values = [];
    for (let k in data) {
      fields.push('`' + k + '`');
      values.push(mysql.escape(data[k]));
    }
    fields = fields.join(', ');
    values = values.join(', ');
    let sql = `REPLACE INTO ${table} (${fields}) VALUES (${values})`;
    return await this.execute(sql);
  }

  async insert (table, data, fetch_last_id = false) {
    return await this.create(table, data, fetch_last_id);
  }

  async update (table, data, where = null) {
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
        v = Utils.isNumber(data[k]) ? data[k] : mysql.escape(data[k]);
      }
      dataArr.push('`' + k + '`=' + v);
    }
    let sql = `UPDATE ${table} SET ${dataArr.join(',')}${where}`;
    let res = await this.execute(sql);
    return res ? true : false;
  }

  async createOrUpdate (table, data, where) {
    let row = await this.findOne(table, where);
    if (row) {
      return await this.update(table, data, where);
    }
    else {
      return await this.create(table, data);
    }
  }

  async delete (table, where = null) {
    where = Utils.parseWhere(where);
    let sql = `DELETE FROM ${table}${where}`;
    let res = await this.execute(sql);
    return res ? true : false;
  }

  async increase (table, field, where = null, qty = 1) {
    let data = {};
    data[field] = ['exp', field + '+' + qty];
    return await this.update(table, data, where);
  }

  async discrease (table, field, where = null, qty = 1) {
    let data = {};
    data[field] = ['exp', field + '-' + qty];
    return await this.update(table, data, where);
  }
}


let pool = null;

const getConnection = async function (options) {
  options = Utils.mergeConfig({
    host: '127.0.0.1',
    user: '',
    password: '',
    database: '',
    port: ''
  }, options);
  if (!pool) {
    pool = mysql.createPool(options);
  }

  let conn = await (new Promise((resolve, reject) => {
    pool.getConnection((err, conn) => {
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


module.exports = getConnection;
