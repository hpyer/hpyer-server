'use strict';

const DB = require('../lib/database');

module.exports = class Model {
  constructor () {
    this.table = '';
  }

  escape (str) {
    return DB.escape(str);
  }

  parseWhere (where) {
    return DB.parseWhere(where);
  }

  async execute (sql, values = null) {
    let db = await Hpyer.getDB();
    if (!db) return null;
    let res = await db.execute(sql, values);
    db.disconnect();
    return res;
  }

  async findSql (sql, values = null) {
    return await this.execute(sql, values);
  }

  async findAll (where = null, fields = '*', page = 1, page_size = 0, order = '', isLock = false) {
    let db = await Hpyer.getDB();
    if (!db) return null;
    let res = await db.findAll(this.table, where, fields, page, page_size, order, isLock);
    db.disconnect();
    return res;
  }

  async findOne (where = null, fields = '*', order = '', isLock = false) {
    let db = await Hpyer.getDB();
    if (!db) return null;
    let res = await db.findOne(this.table, where, fields, order, isLock);
    db.disconnect();
    return res;
  }

  async findCount (where = null, field = 'COUNT(id)') {
    let db = await Hpyer.getDB();
    if (!db) return 0;
    let res = await db.findCount(this.table, where, field);
    db.disconnect();
    return res;
  }

  async create (data, auto_get_last_id = true) {
    let db = await Hpyer.getDB();
    if (!db) return false;
    let res = await db.create(this.table, data, auto_get_last_id);
    db.disconnect();
    return res;
  }

  async update (data, where = null) {
    let db = await Hpyer.getDB();
    if (!db) return false;
    let res = await db.update(this.table, data, where);
    db.disconnect();
    return res;
  }

  async createOrUpdate (data, where) {
    let db = await Hpyer.getDB();
    if (!db) return false;
    let res = await db.createOrUpdate(this.table, data, where);
    db.disconnect();
    return res;
  }

  async delete (where = null) {
    let db = await Hpyer.getDB();
    if (!db) return false;
    let res = await db.delete(this.table, where);
    db.disconnect();
    return res;
  }

  async increase (field, where = null, qty = 1) {
    let db = await Hpyer.getDB();
    if (!db) return false;
    let res = await db.increase(this.table, field, where, qty);
    db.disconnect();
    return res;
  }

  async discrease (field, where = null, qty = 1) {
    let db = await Hpyer.getDB();
    if (!db) return false;
    let res = await db.discrease(this.table, field, where, qty);
    db.disconnect();
    return res;
  }

}
