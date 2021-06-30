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
const Logger_1 = __importDefault(require("../../Logger"));
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
                    Logger_1.default.error('mysql.connect fail. ' + this.options.user + '@' + this.options.host + '.' + this.options.database + ' [password:' + (this.options.password ? 'YES' : 'NO') + ']');
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
                Logger_1.default.info('mysql.execute: ', sql, values);
                return new Promise((resolve, reject) => {
                    let callback = (e, results, fields) => {
                        if (e)
                            return reject(e);
                        if (fetch_last_id && (/^INSERT/ig).test(sql)) {
                            try {
                                this.conn.query('SELECT last_insert_id() AS id', (e1, results1) => {
                                    if (e1)
                                        return reject(e1);
                                    let last_insert_id = results1 && results1[0] && results1[0].id ? results1[0].id : 0;
                                    resolve(last_insert_id);
                                });
                            }
                            catch (e) {
                                // 获取自增id失败时返回插入成功
                                resolve(true);
                            }
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
                Logger_1.default.error('mysql.execute: ', e);
                throw new Error('mysql.execute: ' + e.message);
            }
        });
    }
    ;
    transaction(closure) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!Utils.isFunction(closure))
                return false;
            let res = false;
            yield this.startTrans();
            try {
                res = yield closure(this);
            }
            catch (e) {
                Logger_1.default.error('mysql.transaction: ', e);
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
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            if (!this.conn) {
                this.conn = yield this.getConnection();
            }
            this.conn.beginTransaction((e) => {
                if (e) {
                    Logger_1.default.error('mysql.startTrans: ', e);
                    return reject(false);
                }
                Logger_1.default.info('mysql.startTrans');
                resolve(true);
            });
        }));
    }
    commit() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            if (!this.conn) {
                this.conn = yield this.getConnection();
            }
            this.conn.commit((e) => {
                if (e) {
                    Logger_1.default.error('mysql.commit: ', e);
                    return reject(false);
                }
                Logger_1.default.info('mysql.commit');
                resolve(true);
            });
        }));
    }
    rollback() {
        return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
            if (!this.conn) {
                this.conn = yield this.getConnection();
            }
            this.conn.rollback((e) => {
                if (e) {
                    Logger_1.default.error('mysql.rollback: ', e);
                    return reject(false);
                }
                Logger_1.default.info('mysql.rollback');
                resolve(true);
            });
        }));
    }
    findAll(table, where = null, options = {}) {
        where = Utils.parseWhere(where);
        options = options || {};
        if (typeof options === 'string') {
            options = {
                fields: options,
            };
        }
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
            if (typeof options === 'string') {
                options = {
                    fields: options,
                };
            }
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
            let row = yield this.findOne(table, where, field + ' AS qty');
            if (!row) {
                return false;
            }
            return row.qty;
        });
    }
    create(table, data, fetch_last_id = true) {
        let fields = [], values = [];
        for (let k in data) {
            if (data[k] === undefined || typeof data[k] === 'undefined') {
                continue;
            }
            fields.push('`' + k + '`');
            if (data[k] === null) {
                values.push(`NULL`);
            }
            else {
                values.push(Utils.sqlEscape(data[k]));
            }
        }
        let sql = `INSERT INTO ${table} (${fields.join(', ')}) VALUES (${values.join(', ')})`;
        return this.execute(sql, null, fetch_last_id);
    }
    replace(table, data) {
        let fields = [], values = [];
        for (let k in data) {
            if (data[k] === undefined || typeof data[k] === 'undefined') {
                continue;
            }
            fields.push('`' + k + '`');
            if (data[k] === null) {
                values.push(`NULL`);
            }
            else {
                values.push(Utils.sqlEscape(data[k]));
            }
        }
        let sql = `REPLACE INTO ${table} (${fields.join(', ')}) VALUES (${values.join(', ')})`;
        return this.execute(sql);
    }
    update(table, data, where = null) {
        return __awaiter(this, void 0, void 0, function* () {
            where = Utils.parseWhere(where);
            let dataArr = [];
            for (let k in data) {
                if (data[k] === undefined || typeof data[k] === 'undefined') {
                    continue;
                }
                let v = '';
                if (data[k] === null) {
                    v = 'NULL';
                }
                else if (Utils.isArray(data[k])) {
                    if (data[k][0] == 'exp') {
                        v = data[k][1];
                    }
                }
                else {
                    v = Utils.sqlEscape(data[k]);
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
            where = Utils.parseWhere(where);
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
