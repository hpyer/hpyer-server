'use strict';
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultQueryOptions = void 0;
const Utils = __importStar(require("../../Utils"));
const loglevel_1 = __importDefault(require("loglevel"));
const ContractSql_1 = __importDefault(require("../Contracts/ContractSql"));
const mysql = require('mysql');
exports.DefaultQueryOptions = {
    fields: '*',
    offset: 0,
    limit: 0,
    order: '',
    lock: false,
};
class ProviderMysql extends ContractSql_1.default {
    constructor(pool, options) {
        super();
        this.pool = null;
        this.conn = null;
        this.options = {};
        this.pool = pool;
        this.options = options;
    }
    escape(str) {
        if (typeof str == 'object') {
            let arr = [];
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
    }
    ;
    parseWhereValue(k, v) {
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
                return `\`${k}\` ${v[0]} (${this.escape(v[1]).join(',')})`;
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
    parseWhereItem(k, v) {
        k = k.replace(/\./, '`.`');
        if (Utils.isArray(v) && v.length == 2) {
            return ' AND ' + this.parseWhereValue(k, v);
        }
        else if (Utils.isArray(v) && v.length == 3) {
            // array eg. ['name', 'a', false] or ['name', ['in', ['a', 'b']], 'or']
            let is_and = !(v[2] === false || v[2] == 'OR' || v[2] == 'or');
            return (is_and ? ' AND ' : ' OR ') + this.parseWhereValue(k, v);
        }
        else {
            return ` AND \`${k}\`=${this.escape(v)}`;
        }
    }
    parseWhere(where) {
        if (!where)
            return '';
        let whereStrings = [];
        if (Utils.isObject(where)) {
            for (let k in where) {
                let v = where[k];
                if (k.indexOf('|')) {
                    // eg. {'name|account': 'test'}
                    let is_and = true;
                    if (Utils.isArray(v) && v.length == 3) {
                        is_and = !(v[2] === false || v[2] == 'OR' || v[2] == 'or');
                    }
                    let ks = k.split('|');
                    let items = [];
                    for (let j = 0; j < ks.length; j++) {
                        if (!ks[j])
                            continue;
                        items.push(this.parseWhereItem(ks[j], v).replace(/^\s(AND|OR)\s/gi, ''));
                    }
                    whereStrings.push((is_and ? ' AND ' : ' OR ') + '(' + items.join(' OR ') + ')');
                }
                else if (k.indexOf('&')) {
                    // eg. {'name&account': 'test'}
                    let is_and = true;
                    if (Utils.isArray(v) && v.length == 3) {
                        is_and = !(v[2] === false || v[2] == 'OR' || v[2] == 'or');
                    }
                    let ks = k.split('&');
                    let items = [];
                    for (let j = 0; j < ks.length; j++) {
                        if (!ks[j])
                            continue;
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
            for (let i = 0; i < where.length; i++) {
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
    disconnect() {
        try {
            if (!this.conn)
                return true;
            this.conn.release();
            this.conn = null;
        }
        catch (e) {
        }
        return true;
    }
    getConnection() {
        return new Promise((resolve, reject) => {
            pool.getConnection((err, conn) => {
                if (err) {
                    loglevel_1.default.error('mysql.connect fail. ' + this.options.user + '@' + this.options.host + '.' + this.options.database + ' [password:' + (this.options.password ? 'YES' : 'NO') + ']');
                    reject(err);
                }
                else {
                    resolve(conn);
                }
            });
        });
    }
    execute(sql, values = null, fetch_last_id = false) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!this.conn) {
                    this.conn = yield this.getConnection();
                }
                loglevel_1.default.info('mysql.execute: ', sql, values);
                return new Promise((resolve, reject) => {
                    let callback = (e, results, fields) => {
                        if (e)
                            return reject(e);
                        if (fetch_last_id && (/^INSERT/ig).test(sql)) {
                            this.conn.query('SELECT last_insert_id() AS id', (e1, results1) => {
                                if (e1)
                                    return reject(e1);
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
                loglevel_1.default.error('mysql.execute: ', e);
                throw new Error('mysql.execute: ' + e.message);
            }
        });
    }
    ;
    transaction(callback) {
        return __awaiter(this, void 0, void 0, function* () {
            if (typeof callback != 'function')
                return false;
            let res = false;
            yield this.startTrans();
            try {
                res = yield callback(this);
            }
            catch (e) {
                loglevel_1.default.error('mysql.transaction: ', e);
                res = false;
            }
            if (res === false) {
                yield this.rollback();
            }
            else {
                yield this.commit();
            }
            return res;
        });
    }
    startTrans() {
        return new Promise((resolve, reject) => {
            this.conn.beginTransaction((e) => {
                if (e) {
                    loglevel_1.default.error('mysql.startTrans: ', e);
                    return reject(false);
                }
                loglevel_1.default.info('mysql.startTrans');
                resolve(true);
            });
        });
    }
    commit() {
        return new Promise((resolve, reject) => {
            this.conn.commit((e) => {
                if (e) {
                    loglevel_1.default.error('mysql.commit: ', e);
                    return reject(false);
                }
                loglevel_1.default.info('mysql.commit');
                resolve(true);
            });
        });
    }
    rollback() {
        return new Promise((resolve, reject) => {
            this.conn.rollback((e) => {
                if (e) {
                    loglevel_1.default.error('mysql.rollback: ', e);
                    return reject(false);
                }
                loglevel_1.default.info('mysql.rollback');
                resolve(true);
            });
        });
    }
    findAll(table, where = null, options = {}) {
        where = this.parseWhere(where);
        options = options || {};
        options = Utils.extend({}, exports.DefaultQueryOptions, options);
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
    findOne(table, where = null, options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            options = options || {};
            options.offset = 0;
            options.limit = 1;
            let rows = yield this.findAll(table, where, options);
            if (!rows || !rows.length) {
                return false;
            }
            return rows[0];
        });
    }
    findCount(table, where = null, field = 'COUNT(1)') {
        return __awaiter(this, void 0, void 0, function* () {
            let options = {
                fields: field + ' AS qty',
            };
            let row = yield this.findOne(table, where, options);
            if (!row) {
                return false;
            }
            return row.qty;
        });
    }
    create(table, data, fetch_last_id = true) {
        let fields = [], values = [];
        for (let k in data) {
            fields.push('`' + k + '`');
            values.push(this.escape(data[k]));
        }
        let sql = `INSERT INTO ${table} (${fields.join(', ')}) VALUES (${values.join(', ')})`;
        return this.execute(sql, null, fetch_last_id);
    }
    replace(table, data) {
        let fields = [], values = [];
        for (let k in data) {
            fields.push('`' + k + '`');
            values.push(this.escape(data[k]));
        }
        let sql = `REPLACE INTO ${table} (${fields.join(', ')}) VALUES (${values.join(', ')})`;
        return this.execute(sql);
    }
    update(table, data, where = null) {
        return __awaiter(this, void 0, void 0, function* () {
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
            let res = yield this.execute(sql);
            return res ? true : false;
        });
    }
    delete(table, where = null) {
        return __awaiter(this, void 0, void 0, function* () {
            where = this.parseWhere(where);
            let sql = `DELETE FROM ${table}${where}`;
            let res = yield this.execute(sql);
            return res ? true : false;
        });
    }
    increase(table, field, where = null, qty = 1) {
        let data = {};
        data[field] = ['exp', field + '+' + qty];
        return this.update(table, data, where);
    }
    discrease(table, field, where = null, qty = 1) {
        let data = {};
        data[field] = ['exp', field + '-' + qty];
        return this.update(table, data, where);
    }
}
let pool = null;
const getDbInstance = function (options) {
    if (!pool) {
        pool = mysql.createPool(options);
    }
    return new ProviderMysql(pool, options);
};
exports.default = getDbInstance;
