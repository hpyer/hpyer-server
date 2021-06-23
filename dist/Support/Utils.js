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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseWhereValue = exports.sqlEscape = exports.jsonError = exports.jsonSuccess = exports.parseQueryString = exports.buildQueryString = exports.urlDecode = exports.urlEncode = exports.htmlUnescape = exports.htmlEscape = exports.doRequest = exports.md5File = exports.createHmac = exports.createHash = exports.getRandomString = exports.getRandomNumber = exports.base64Decode = exports.base64Encode = exports.sleep = exports.matchAll = exports.toLineCase = exports.toCamelCase = exports.toStudlyCase = exports.toLowerFirstLetter = exports.toUpperFirstLetter = exports.pad = exports.repeat = exports.rtrim = exports.ltrim = exports.trim = exports.inArray = exports.isMatch = exports.isEmpty = exports.isDate = exports.isFunction = exports.isArray = exports.isObject = exports.isNumberString = exports.isNumber = exports.isString = exports.toString = exports.isUuid = exports.getUuid = exports.getMoment = exports.isDateString = exports.getFormatTime = exports.xssFilter = exports.clone = exports.extend = exports.merge = void 0;
exports.isAjaxRequest = exports.parseWhere = exports.parseWhereItem = void 0;
const moment_1 = __importDefault(require("moment"));
const crypto_1 = __importDefault(require("crypto"));
const fs_1 = __importDefault(require("fs"));
const stream_1 = __importDefault(require("stream"));
const Uuid = __importStar(require("uuid"));
const Xss = __importStar(require("xss"));
const UrlEncode = __importStar(require("urlencode"));
const axios_1 = __importDefault(require("axios"));
const Logger_1 = __importDefault(require("../Support/Logger"));
const mysql_1 = __importDefault(require("mysql"));
const merge = (target, source) => {
    if (exports.isObject(source)) {
        if (source.constructor !== Object) {
            target = source;
        }
        else {
            if (!target || !exports.isObject(target)) {
                target = {};
            }
            Object.keys(source).map((k) => {
                if (!target[k]) {
                    target[k] = null;
                }
                target[k] = exports.merge(target[k], source[k]);
            });
        }
    }
    else if (exports.isArray(source)) {
        if (!target || !exports.isArray(target)) {
            target = [];
        }
        target = target.concat(target, source);
    }
    else {
        target = source;
    }
    return target;
};
exports.merge = merge;
/**
 * 扩展对象
 * @param target 目标对象
 * @param args 任意个对象
 */
const extend = (target = {}, ...args) => {
    let i = 0;
    const length = args.length;
    let options;
    let name;
    let src;
    let copy;
    if (!target) {
        target = exports.isArray(args[0]) ? [] : {};
    }
    for (; i < length; i++) {
        options = args[i];
        if (!options) {
            continue;
        }
        for (name in options) {
            src = target[name];
            copy = options[name];
            if (src && src === copy) {
                continue;
            }
            target[name] = exports.merge(target[name], copy);
        }
    }
    return target;
};
exports.extend = extend;
/**
 * 克隆变量
 * @param obj 原变量
 */
const clone = function (obj) {
    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj)
        return obj;
    // Handle Date
    if (obj instanceof Date) {
        let copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }
    // Handle Array
    if (obj instanceof Array) {
        let copy = [];
        for (let i = 0, len = obj.length; i < len; ++i) {
            copy[i] = exports.clone(obj[i]);
        }
        return copy;
    }
    // Handle Object
    if (obj instanceof Object) {
        let copy = {};
        for (let attr in obj) {
            if (obj.hasOwnProperty(attr))
                copy[attr] = exports.clone(obj[attr]);
        }
        return copy;
    }
    throw new Error("Unable to copy obj! Its type isn't supported.");
};
exports.clone = clone;
/**
 * 过滤xss
 * @param str 原字符串
 * @param whiteList 允许的标签
 */
const xssFilter = function (str, whiteList = {}) {
    let myxss = new Xss.FilterXSS({
        whiteList: whiteList,
        stripIgnoreTag: true,
        stripIgnoreTagBody: ['script'] // script标签较特殊，需要过滤标签中间的内容
    });
    return myxss.process(str);
};
exports.xssFilter = xssFilter;
/**
 * 格式化时间
 * @param format 输出格式，默认：YYYY-MM-DD HH:mm:ss
 * @param datetime 时间对象、字符串等，默认：null 表示当前时间
 * @param offset 时间偏移量数值，正数表示增加，负数表示减少，默认：0 表示不做偏移
 * @param offsetUnit 时间偏移量单位，默认：'seconds'
 */
const getFormatTime = function (format = '', datetime = null, offset = 0, offsetUnit = 'seconds') {
    format = format || 'YYYY-MM-DD HH:mm:ss';
    let obj;
    if (exports.isNumber(datetime) || exports.isNumberString(datetime)) {
        obj = moment_1.default.unix(datetime);
    }
    else if (datetime) {
        obj = moment_1.default(datetime);
    }
    else {
        obj = moment_1.default();
    }
    if (format.toUpperCase() == 'ISO8601') {
        obj = obj.utc();
        format = '';
    }
    if (offset > 0) {
        obj.add(offset, offsetUnit);
    }
    if (offset < 0) {
        obj.subtract(offset, offsetUnit);
    }
    let res = obj.format(format);
    return res == 'Invalid date' ? '' : res;
};
exports.getFormatTime = getFormatTime;
/**
 * 判断是否时间字符串
 * @param datetime 时间字符串
 */
const isDateString = function (datetime) {
    if (!datetime)
        return false;
    return moment_1.default(datetime).isValid();
};
exports.isDateString = isDateString;
/**
 * 获取 Moment 类
 */
const getMoment = function () {
    return moment_1.default;
};
exports.getMoment = getMoment;
/**
 * 获取 UUID
 * @param version 版本，可选：v1、v2、v3、v4，默认：v1
 */
const getUuid = function (version = 'v1') {
    return Uuid[version]();
};
exports.getUuid = getUuid;
/**
 * 判断是否 UUID
 * @param str 字符串
 */
const isUuid = (str) => {
    return str && exports.isString(str) && exports.isMatch(/^[a-z0-9]{8}(-[a-z0-9]{4}){3}-[a-z0-9]{12}$/i, str);
};
exports.isUuid = isUuid;
/**
 * 转成字符串
 * @param data 要转化的数据
 */
exports.toString = Object.prototype.toString;
/**
 * 判断是否字符串
 * @param data 要判断的数据
 */
const isString = (data) => {
    return data && exports.toString.call(data) == '[object String]';
};
exports.isString = isString;
/**
 * 判断是否数字
 * @param data 要判断的数据
 */
const isNumber = (data) => {
    return data && exports.toString.call(data) == '[object Number]';
};
exports.isNumber = isNumber;
/**
 * 判断是否数字字符串
 * @param data 要判断的数据
 */
const isNumberString = (data) => {
    return exports.isString(data) && exports.isMatch(/^(-?\d+)(\.\d+)?$/i, data);
};
exports.isNumberString = isNumberString;
/**
 * 判断是否对象
 * @param data 要判断的数据
 */
const isObject = (data) => {
    return data && exports.toString.call(data) == '[object Object]';
};
exports.isObject = isObject;
/**
 * 判断是否数组
 * @param data 要判断的数据
 */
const isArray = (data) => {
    return data && exports.toString.call(data) == '[object Array]';
};
exports.isArray = isArray;
/**
 * 判断是否函数
 * @param data 要判断的数据
 */
const isFunction = (data) => {
    return data && (exports.toString.call(data) == '[object Function]' || exports.toString.call(data) == '[object AsyncFunction]');
};
exports.isFunction = isFunction;
/**
 * 判断是否日期对象
 * @param data 要判断的数据
 */
const isDate = (data) => {
    return data && exports.toString.call(data) == '[object Date]';
};
exports.isDate = isDate;
/**
 * 判断是否为空
 * @param data 要判断的数据
 */
const isEmpty = (obj) => {
    if (obj === undefined || obj === null || obj === '')
        return true;
    if (exports.isNumber(obj) && isNaN(obj))
        return true;
    if (exports.isObject(obj)) {
        for (let key in obj) {
            return false && key;
        }
        return true;
    }
    return false;
};
exports.isEmpty = isEmpty;
/**
 * 判断是否符合正则
 * @param reg 正则对象
 * @param str 要验证的字符串
 */
const isMatch = (reg, str) => {
    return !!('' + str).match(reg);
};
exports.isMatch = isMatch;
/**
 * 判断是否存在数组重
 * @param data 要查找的数据
 * @param arr 被查找的数组
 * @param strict 是否严格模式
 */
const inArray = (data, arr, strict = false) => {
    if (!exports.isArray(arr))
        return strict ? data === arr : data == arr;
    if (exports.isFunction(arr.findIndex)) {
        return arr.findIndex((o) => { return strict ? o === data : o == data; }) > -1;
    }
    else {
        let flag = false;
        for (let i = 0; i < arr.length; i++) {
            if (strict ? data === arr[i] : data == arr[i]) {
                flag = true;
                break;
            }
        }
        return flag;
    }
};
exports.inArray = inArray;
/**
 * 去除字符串左右的符号
 * @param str 原字符串
 * @param chars 要去除的符号，正则字符串，默认空白符
 */
const trim = (str, chars = '\\s+') => {
    if (!str || !exports.isString(str))
        return '';
    return str.replace(new RegExp('^' + chars + '|' + chars + '$', 'gm'), '');
};
exports.trim = trim;
/**
 * 去除字符串左边的符号
 * @param str 原字符串
 * @param chars 要去除的符号，正则字符串，默认空白符
 */
const ltrim = (str, chars = '\\s+') => {
    if (!str || !exports.isString(str))
        return '';
    return str.replace(new RegExp('^' + chars, 'gm'), '');
};
exports.ltrim = ltrim;
/**
 * 去除字符串右边的符号
 * @param str 原字符串
 * @param chars 要去除的符号，正则字符串，默认空白符
 */
const rtrim = (str, chars = '\\s+') => {
    if (!str || !exports.isString(str))
        return '';
    return str.replace(new RegExp(chars + '$', 'gm'), '');
};
exports.rtrim = rtrim;
/**
 * 将字符串复制为多份
 * @param str 要复制的字符串
 * @param num 要复制的次数
 */
const repeat = (str, num) => {
    return new Array(num + 1).join(str);
};
exports.repeat = repeat;
/**
 * 给字符串填充字符
 * @param str 原字符串
 * @param len 要填充到的字符串长度
 * @param chr 要填充的字符
 * @param leftJustify Ture 表示左侧填充，否则反之
 */
const pad = function (str, len, chr = ' ', leftJustify = true) {
    let padding = (str.length >= len) ? '' : exports.repeat(chr, len - str.length >>> 0);
    return leftJustify ? padding + str : str + padding;
};
exports.pad = pad;
/**
 * 将单词（句子）首字母转成大写，'hello word' => 'Hello World'
 * @param str 要转换的单词（句子）
 */
const toUpperFirstLetter = function (str) {
    return str.replace(/\b[a-z]/gi, function (letter) {
        return letter.toUpperCase();
    });
};
exports.toUpperFirstLetter = toUpperFirstLetter;
/**
 * 将单词（句子）首字母转成小写，'Hello World' => 'hello word'
 * @param str 要转换的单词（句子）
 */
const toLowerFirstLetter = function (str) {
    return str.replace(/\b[a-z]/gi, function (letter) {
        return letter.toLowerCase();
    });
};
exports.toLowerFirstLetter = toLowerFirstLetter;
/**
 * 字符串驼峰格式（首字母大写），'hello word' => 'HelloWorld'
 * @param str 要转换的字符串
 * @param separator 单词分隔符，默认：'[\\-|\\_]'
 */
const toStudlyCase = function (str, separator = '[\\-|\\_]') {
    let reg = new RegExp(separator + '(\\w)', 'gi');
    return exports.toUpperFirstLetter(str.replace(reg, ' ')).replace(/\s/gi, '');
};
exports.toStudlyCase = toStudlyCase;
/**
 * 字符串驼峰格式（首字母小写），'hello word' => 'HelloWorld'
 * @param str 要转换的字符串
 * @param separator 单词分隔符，默认：'[\\-|\\_]'
 */
const toCamelCase = (str, separator = '[-|\\_]') => {
    return exports.toLowerFirstLetter(exports.toStudlyCase(str, separator));
};
exports.toCamelCase = toCamelCase;
/**
 * 字符串转分割线格式
 * @param str 原字符串
 * @param separator 单词分隔符
 */
const toLineCase = (str, separator = '-') => {
    return str.replace(/([A-Z])/g, separator + "$1").toLowerCase();
};
exports.toLineCase = toLineCase;
/**
 * 获取匹配到的所有字符串
 * @param reg 正则表达式
 * @param str 原字符串
 */
const matchAll = function (reg, string) {
    let matched = [];
    let res;
    while ((res = reg.exec(string)) != null) {
        matched.push(res);
    }
    return matched;
};
exports.matchAll = matchAll;
/**
 * 休眠，暂停代码执行
 * @param time 毫秒数
 */
const sleep = function (time = 0) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, time);
    });
};
exports.sleep = sleep;
/**
 * base64 编码
 * @param str 原字符串
 */
const base64Encode = function (str) {
    let buffer = Buffer.from(str);
    return buffer.toString('base64');
};
exports.base64Encode = base64Encode;
/**
 * base64 解码
 * @param str 原字符串
 */
const base64Decode = function (str) {
    let buffer = Buffer.from(str, 'base64');
    return buffer.toString();
};
exports.base64Decode = base64Decode;
/**
 * 生成 min 到 max 之间的随机数
 * @param max 最大值（不包含）
 * @param min 最小值（包含），默认：0
 */
const getRandomNumber = function (max, min = 0) {
    if (max < 0 || min < 0) {
        throw new Error(`Invalid params. max: ${max}, min: ${min}.`);
    }
    if (max == min)
        return min;
    max = Math.max(max, min);
    min = Math.min(max, min);
    return min + Math.floor(Math.random() * (max - min));
};
exports.getRandomNumber = getRandomNumber;
/**
 * 生成随机字符串
 * @param len 生成的随机字符串长度
 * @param type 生成方式，可选：string/password、code/number，默认：string
 */
const getRandomString = function (len = 16, type = 'string') {
    let chars = '';
    switch (type) {
        case 'code':
        case 'number':
            chars = '1234567890';
            break;
        case 'password':
        case 'string':
        default:
            chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
    }
    let str = '';
    for (let i = 0; i < len; i++) {
        str += chars.charAt(exports.getRandomNumber(chars.length - 1));
    }
    return str;
};
exports.getRandomString = getRandomString;
/**
 * 计算哈希字符串
 * @param str 原文字符串
 * @param type 哈希方式，可选：sha1、md5等待，默认：sha1
 * @param target 生成的目标类型，可选：latin1、hex、base64，默认：hex
 */
const createHash = function (str, type = 'sha1', target = 'hex') {
    return crypto_1.default.createHash(type).update(str).digest(target);
};
exports.createHash = createHash;
/**
 * 计算加密字符串
 * @param str 原文字符串
 * @param type 加密方式，可选：sha256等待，默认：sha256
 * @param target 生成的目标类型，可选：latin1、hex、base64，默认：hex
 */
const createHmac = function (str, key, type = 'sha256', target = 'hex') {
    return crypto_1.default.createHmac(type, key).update(str).digest(target);
};
exports.createHmac = createHmac;
/**
 * 计算文件的 md5 值
 * @param path 文件路径或文件可读流
 */
const md5File = function (path) {
    return new Promise((reslove, reject) => {
        let stream;
        if (exports.isString(path)) {
            stream = fs_1.default.createReadStream(path);
        }
        else {
            stream = new stream_1.default.PassThrough();
            path.pipe(stream);
        }
        let md5sum = crypto_1.default.createHash('md5');
        stream.on('data', function (chunk) {
            md5sum.update(chunk);
        });
        stream.on('end', function () {
            let str = md5sum.digest('hex').toUpperCase();
            reslove(str);
        });
    });
};
exports.md5File = md5File;
/**
 * 发起http请求
 * @param  payload  Axios请求参数，详见：https://www.npmjs.com/package/axios#request-config
 * @param  returnResponse  是否返回 AxiosResponse 对象，默认：false，表示直接返回 AxiosResponse.data
 * @param  logContent  是否在日志中打印返回内容，默认：false
 */
const doRequest = function (payload, returnResponse = false, logContent = false) {
    let start_time = (new Date).getTime();
    Logger_1.default.info(`doRequest_${start_time}`, payload);
    return axios_1.default.request(payload).then((res) => {
        let end_time = (new Date).getTime();
        let log_data = null;
        if (logContent) {
            log_data = res.data;
        }
        else {
            if (payload.responseType == 'stream') {
                log_data = '[ReadableStream]';
            }
            else if (payload.responseType == 'arraybuffer') {
                log_data = '[Buffer]';
            }
            else {
                log_data = '[Content]';
            }
        }
        Logger_1.default.info(`doRequest.success_${start_time}`, `${end_time - start_time}ms`, log_data);
        return returnResponse ? res : res.data;
    }).catch(err => {
        let end_time = (new Date).getTime();
        Logger_1.default.error(`doRequest.error_${start_time}`, `${end_time - start_time}ms`, `ERR_MSG: ${err.message}`);
        return null;
    });
};
exports.doRequest = doRequest;
/**
 * 编码html特殊符号
 * @param text 原字符串
 */
const htmlEscape = function (text) {
    return text.replace(/[<>"&]/g, function (match) {
        switch (match) {
            case '<':
                return '&lt;';
            case '>':
                return '&gt;';
            case '&':
                return '&amp;';
            case '"':
                return '&quot;';
        }
        return match;
    });
};
exports.htmlEscape = htmlEscape;
/**
 * 解码html特殊符号
 * @param text 原字符串
 */
const htmlUnescape = function (text) {
    return text.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"');
};
exports.htmlUnescape = htmlUnescape;
/**
 * url 编码
 * @param args 原字符串
 */
const urlEncode = function () {
    return UrlEncode.encode.apply(null, arguments);
};
exports.urlEncode = urlEncode;
/**
 * url 解码
 * @param args 原字符串
 */
const urlDecode = function () {
    return UrlEncode.decode.apply(null, arguments);
};
exports.urlDecode = urlDecode;
/**
 * 构建 querystring 字符串
 * @param args 参数
 */
const buildQueryString = function () {
    return UrlEncode.stringify.apply(null, arguments);
};
exports.buildQueryString = buildQueryString;
/**
 * 解析 querystring 字符串
 * @param args string
 */
const parseQueryString = function () {
    return UrlEncode.parse.apply(null, arguments);
};
exports.parseQueryString = parseQueryString;
/**
 * 构建成功时的json对象
 * @param data 成功时要返回的数据，默认：null
 * @param message 成功时要返回的消息，默认：'ok'
 */
const jsonSuccess = (data, message = 'ok') => {
    return { success: true, code: 0, data, message };
};
exports.jsonSuccess = jsonSuccess;
/**
 * 构建失败时的json对象
 * @param message 失败时的错误消息
 * @param code 失败时的错误代码，默认：'1'
 * @param data 失败时要返回的数据，默认：null
 */
const jsonError = (message, code = '1', data = null) => {
    return { success: false, code, data, message };
};
exports.jsonError = jsonError;
/**
 * SQL字符转义
 * @param str 待转义的字符串或字符串数组
 */
const sqlEscape = function (str) {
    if (exports.isArray(str)) {
        let arr = [];
        for (let i = 0; i < str.length; i++) {
            arr[i] = exports.sqlEscape(str[i]);
        }
        return arr;
    }
    else {
        return mysql_1.default.escape(str);
    }
};
exports.sqlEscape = sqlEscape;
/**
 * 解析where查询的值
 * @param k 字段名
 * @param v 字段值
 */
const parseWhereValue = function (k, v) {
    if (exports.isArray(v[1])) {
        // array eg. ['in', ['value1', 'value2', 'value3']]
        if (v[0].toLowerCase() == 'between') {
            return `${k} BETWEEN ${exports.sqlEscape(v[1][0])} AND ${exports.sqlEscape(v[1][1])}`;
        }
        else if (v[0].toLowerCase() == 'like') {
            let a = [];
            for (let i = 0; i < v[1].length; i++) {
                a.push(`${k} LIKE ${exports.sqlEscape(v[1][i])}`);
            }
            return a.join(' OR ');
        }
        else {
            return `${k} ${v[0]} (${exports.sqlEscape(v[1]).join(',')})`;
        }
    }
    else if (v[0] == 'exp') {
        // array eg. ['exp', sql]
        return `${k} ${v[1]}`;
    }
    else {
        // array eg. ['=', 'value'] or ['like', 'value%']
        return `${k} ${v[0]} (${exports.sqlEscape(v[1])})`;
    }
};
exports.parseWhereValue = parseWhereValue;
/**
 * 解析where查询项
 * @param k 字段名
 * @param v 字段值
 */
const parseWhereItem = function (k, v) {
    k = k.replace(/\./, '.');
    if (exports.isArray(v) && v.length == 2) {
        return ' AND ' + exports.parseWhereValue(k, v);
    }
    else if (exports.isArray(v) && v.length == 3) {
        // array eg. ['name', 'a', false] or ['name', ['in', ['a', 'b']], 'or']
        let is_and = !(v[2] === false || v[2] == 'OR' || v[2] == 'or');
        return (is_and ? ' AND ' : ' OR ') + exports.parseWhereValue(k, v);
    }
    else {
        return ` AND ${k}=${exports.sqlEscape(v)}`;
    }
};
exports.parseWhereItem = parseWhereItem;
/**
 * 解析where查询
 * @param where 查询信息
 */
const parseWhere = function (where) {
    if (!where)
        return '';
    let whereStrings = [];
    if (exports.isObject(where)) {
        for (let k in where) {
            let v = where[k];
            if (k.indexOf('|')) {
                // eg. {'name|account': 'test'}
                let is_and = true;
                if (exports.isArray(v) && v.length == 3) {
                    is_and = !(v[2] === false || v[2] == 'OR' || v[2] == 'or');
                }
                let ks = k.split('|');
                let items = [];
                for (let j = 0; j < ks.length; j++) {
                    if (!ks[j])
                        continue;
                    items.push(exports.parseWhereItem(ks[j], v).replace(/^\s(AND|OR)\s/gi, ''));
                }
                whereStrings.push((is_and ? ' AND ' : ' OR ') + '(' + items.join(' OR ') + ')');
            }
            else if (k.indexOf('&')) {
                // eg. {'name&account': 'test'}
                let is_and = true;
                if (exports.isArray(v) && v.length == 3) {
                    is_and = !(v[2] === false || v[2] == 'OR' || v[2] == 'or');
                }
                let ks = k.split('&');
                let items = [];
                for (let j = 0; j < ks.length; j++) {
                    if (!ks[j])
                        continue;
                    items.push(exports.parseWhereItem(ks[j], v).replace(/^\s(AND|OR)\s/gi, ''));
                }
                whereStrings.push((is_and ? ' AND ' : ' OR ') + '(' + items.join(' AND ') + ')');
            }
            else {
                whereStrings.push(exports.parseWhereItem(k, v));
            }
        }
    }
    else if (exports.isArray(where)) {
        // array eg. ['`name`=\'a\'', ['`name`=\'b\'', false], ['`status`=1', 'and']]
        for (let i = 0; i < where.length; i++) {
            let v = where[i];
            if (exports.isArray(v) && v.length == 2) {
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
};
exports.parseWhere = parseWhere;
/**
 * 是否ajax请求
 * @param  ctx  koa的上下文
 */
const isAjaxRequest = function (ctx) {
    if (ctx.request.is_ajax || (ctx.request.header['x-requested-with'] && ctx.request.header['x-requested-with'] == 'XMLHttpRequest')) {
        return true;
    }
    return false;
};
exports.isAjaxRequest = isAjaxRequest;
