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
exports.jsonError = exports.jsonSuccess = exports.parseQueryString = exports.buildQueryString = exports.urlDecode = exports.urlEncode = exports.htmlUnescape = exports.htmlEscape = exports.md5File = exports.createHmac = exports.createHash = exports.getRandomString = exports.getRandomNumber = exports.base64Decode = exports.base64Encode = exports.sleep = exports.matchAll = exports.toLineCase = exports.toCamelCase = exports.pad = exports.repeat = exports.rtrim = exports.ltrim = exports.trim = exports.inArray = exports.isMatch = exports.isEmpty = exports.isDate = exports.isFunction = exports.isArray = exports.isObject = exports.isNumberString = exports.isNumber = exports.isString = exports.toString = exports.isUuid = exports.getUuid = exports.getMoment = exports.isDateString = exports.getFormatTime = exports.xssFilter = exports.clone = exports.extend = void 0;
const moment_1 = __importDefault(require("moment"));
const crypto_1 = __importDefault(require("crypto"));
const fs_1 = __importDefault(require("fs"));
const stream_1 = __importDefault(require("stream"));
const Uuid = __importStar(require("uuid"));
const Xss = __importStar(require("xss"));
const UrlEncode = __importStar(require("urlencode"));
/**
 * 扩展对象
 * @param {object} target 目标对象
 * @param {object} args 任意个对象
 * @return {object}
 */
exports.extend = (target = {}, ...args) => {
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
            if (exports.isArray(copy)) {
                target[name] = exports.extend([], copy);
            }
            else if (exports.isObject(copy)) {
                target[name] = exports.extend(src && exports.isObject(src) ? src : {}, copy);
            }
            else {
                target[name] = copy;
            }
        }
    }
    return target;
};
/**
 * 克隆变量
 * @param {any} obj 原变量
 * @return {any}
 */
exports.clone = function (obj) {
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
/**
 * 过滤xss
 * @param {string} str 原字符串
 * @param {XSS.IWhiteList} whiteList 允许的标签
 * @return {string} 过滤后的字符串
 */
exports.xssFilter = function (str, whiteList = {}) {
    let myxss = new Xss.FilterXSS({
        whiteList: whiteList,
        stripIgnoreTag: true,
        stripIgnoreTagBody: ['script'] // script标签较特殊，需要过滤标签中间的内容
    });
    return myxss.process(str);
};
/**
 * 格式化时间
 * @param {string} format 输出格式
 * @param {Moment.MomentInput} datetime 时间对象、字符串等
 * @param {number} offset 时间偏移量数值，正数表示增加，负数表示减少
 * @param {Moment.unitOfTime.DurationConstructor} offsetUnit 时间偏移量单位，默认：'seconds'
 * @return {string} 格式化后的时间字符串
 */
exports.getFormatTime = function (format = '', datetime = null, offset = 0, offsetUnit = 'seconds') {
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
/**
 * 判断是否时间字符串
 * @param {string} datetime 时间字符串
 * @return {boolean} True 表示格式正确
 */
exports.isDateString = function (datetime) {
    if (!datetime)
        return false;
    return moment_1.default(datetime).isValid();
};
/**
 * 获取 Moment 类
 * @return {Function} Moment 类
 */
exports.getMoment = function () {
    return moment_1.default;
};
/**
 * 获取 UUID
 * @return {string} version 版本，可选：v1、v2、v3、v4，默认：v1
 */
exports.getUuid = function (version = 'v1') {
    return Uuid[version]();
};
/**
 * 判断是否 UUID
 * @param {string} version 版本，可选：v1、v2、v3、v4，默认：v1
 * @return {boolean} True 表示格式正确
 */
exports.isUuid = (str) => {
    return str && exports.isString(str) && exports.isMatch(/^[a-z0-9]{8}(-[a-z0-9]{4}){3}-[a-z0-9]{12}$/i, str);
};
/**
 * 转成字符串
 * @param {any} args 要转化的数据
 * @return {string} 转化后的字符串
 */
exports.toString = Object.prototype.toString;
/**
 * 判断是否字符串
 * @param {any} data 要判断的数据
 * @return {boolean} True 表示格式正确
 */
exports.isString = (data) => {
    return data && exports.toString.call(data) == '[object String]';
};
/**
 * 判断是否数字
 * @param {any} data 要判断的数据
 * @return {boolean} True 表示格式正确
 */
exports.isNumber = (data) => {
    return data && exports.toString.call(data) == '[object Number]';
};
/**
 * 判断是否数字字符串
 * @param {any} data 要判断的数据
 * @return {boolean} True 表示格式正确
 */
exports.isNumberString = (data) => {
    return exports.isString(data) && exports.isMatch(/^(-?\d+)(\.\d+)?$/i, data);
};
/**
 * 判断是否对象
 * @param {any} data 要判断的数据
 * @return {boolean} True 表示格式正确
 */
exports.isObject = (data) => {
    return data && exports.toString.call(data) == '[object Object]';
};
/**
 * 判断是否数组
 * @param {any} data 要判断的数据
 * @return {boolean} True 表示格式正确
 */
exports.isArray = (data) => {
    return data && exports.toString.call(data) == '[object Array]';
};
/**
 * 判断是否函数
 * @param {any} data 要判断的数据
 * @return {boolean} True 表示格式正确
 */
exports.isFunction = (data) => {
    return data && exports.toString.call(data) == '[object Function]' || exports.toString.call(data) == '[object AsyncFunction]';
};
/**
 * 判断是否日期对象
 * @param {any} data 要判断的数据
 * @return {boolean} True 表示格式正确
 */
exports.isDate = (data) => {
    return data && exports.toString.call(data) == '[object Date]';
};
/**
 * 判断是否为空
 * @param {any} data 要判断的数据
 * @return {boolean} True 表示格式正确
 */
exports.isEmpty = (obj) => {
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
/**
 * 判断是否符合正则
 * @param {RegExp} reg 正则对象
 * @param {string} str 要验证的字符串
 * @return {boolean} True 表示符合
 */
exports.isMatch = (reg, str) => {
    return !!('' + str).match(reg);
};
/**
 * 判断是否存在数组重
 * @param {any} data 要查找的数据
 * @param {array} arr 被查找的数组
 * @param {boolean} strict 是否严格模式
 * @return {boolean} True 表示存在
 */
exports.inArray = (data, arr, strict = false) => {
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
/**
 * 去除字符串左右的符号
 * @param {string} str 原字符串
 * @param {string} chars 要去除的符号，正则字符串，默认空白符
 * @return {string} 过滤后的字符串
 */
exports.trim = (str, chars = '\\s+') => {
    if (!str || !exports.isString(str))
        return '';
    return str.replace(new RegExp('^' + chars + '|' + chars + '$', 'gm'), '');
};
/**
 * 去除字符串左边的符号
 * @param {string} str 原字符串
 * @param {string} chars 要去除的符号，正则字符串，默认空白符
 * @return {string} 过滤后的字符串
 */
exports.ltrim = (str, chars = '\\s+') => {
    if (!str || !exports.isString(str))
        return '';
    return str.replace(new RegExp('^' + chars, 'gm'), '');
};
/**
 * 去除字符串右边的符号
 * @param {string} str 原字符串
 * @param {string} chars 要去除的符号，正则字符串，默认空白符
 * @return {string} 过滤后的字符串
 */
exports.rtrim = (str, chars = '\\s+') => {
    if (!str || !exports.isString(str))
        return '';
    return str.replace(new RegExp(chars + '$', 'gm'), '');
};
/**
 * 将字符串复制为多份
 * @param {string} str 要复制的字符串
 * @param {number} num 要复制的次数
 * @return {string} 处理后的字符串
 */
exports.repeat = (str, num) => {
    return new Array(num + 1).join(str);
};
/**
 * 给字符串填充字符
 * @param {string} str 原字符串
 * @param {number} len 要填充到的字符串长度
 * @param {char} chr 要填充的字符
 * @param {boolean} leftJustify Ture 表示左侧填充，否则反之
 * @return {string} 处理后的字符串
 */
exports.pad = function (str, len, chr = ' ', leftJustify = true) {
    let padding = (str.length >= len) ? '' : exports.repeat(chr, len - str.length >>> 0);
    return leftJustify ? padding + str : str + padding;
};
/**
 * 字符串转换驼峰格式
 * @param {string} str 原字符串
 * @param {string} separator 单词分隔符
 * @return {string} 处理后的字符串
 */
exports.toCamelCase = (str, separator = '[-|\\_]') => {
    let reg = new RegExp(separator + '(\\w)', 'g');
    return str.replace(reg, function (all, letter) {
        return letter.toUpperCase();
    });
};
/**
 * 字符串转分割线格式
 * @param {string} str 原字符串
 * @param {string} separator 单词分隔符
 * @return {string} 处理后的字符串
 */
exports.toLineCase = (str, separator = '-') => {
    return str.replace(/([A-Z])/g, separator + "$1").toLowerCase();
};
/**
 * 获取匹配到的所有字符串
 * @param {RegExp} reg 正则表达式
 * @param {string} str 原字符串
 * @return {array} 匹配到的结果
 */
exports.matchAll = function (reg, string) {
    let matched = [];
    let res;
    while ((res = reg.exec(string)) != null) {
        matched.push(res);
    }
    return matched;
};
/**
 * 休眠，暂停代码执行
 * @param {number} time 毫秒数
 * @return {Promise<void>} 无
 */
exports.sleep = function (time = 0) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, time);
    });
};
/**
 * base64 编码
 * @param {string} str 原字符串
 * @return {string} 处理后的字符串
 */
exports.base64Encode = function (str) {
    let buffer = Buffer.from(str);
    return buffer.toString('base64');
};
/**
 * base64 解码
 * @param {string} str 原字符串
 * @return {string} 处理后的字符串
 */
exports.base64Decode = function (str) {
    let buffer = Buffer.from(str, 'base64');
    return buffer.toString();
};
/**
 * 生成 min 到 max 之间的随机数
 * @param {number} max 最大值（不包含）
 * @param {number} min 最小值（包含），默认：0
 * @return {number} 随机数
 */
exports.getRandomNumber = function (max, min = 0) {
    if (max <= 0 || min <= 0) {
        throw new Error(`Invalid params. max: ${max}, min: ${min}.`);
    }
    if (max == min)
        return min;
    max = Math.max(max, min);
    min = Math.min(max, min);
    return min + Math.floor(Math.random() * (max - min));
};
/**
 * 生成随机字符串
 * @param {number} len 生成的随机字符串长度
 * @param {string} type 生成方式，可选：string/password、code/number，默认：string
 * @return {string} 随机字符串
 */
exports.getRandomString = function (len = 16, type = 'string') {
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
/**
 * 计算哈希字符串
 * @param {string} str 原文字符串
 * @param {string} type 哈希方式，可选：sha1、md5等待，默认：sha1
 * @param {string} target 生成的目标类型，可选：latin1、hex、base64，默认：hex
 * @return {string} 哈希字符串
 */
exports.createHash = function (str, type = 'sha1', target = 'hex') {
    return crypto_1.default.createHash(type).update(str).digest(target);
};
/**
 * 计算加密字符串
 * @param {string} str 原文字符串
 * @param {string} type 加密方式，可选：sha256等待，默认：sha256
 * @param {string} target 生成的目标类型，可选：latin1、hex、base64，默认：hex
 * @return {string} 加密字符串
 */
exports.createHmac = function (str, key, type = 'sha256', target = 'hex') {
    return crypto_1.default.createHmac(type, key).update(str).digest(target);
};
/**
 * 计算文件的 md5 值
 * @param {string | Stream.Readable} path 文件路径或文件可读流
 * @return {Promise<string>} md5字符串
 */
exports.md5File = function (path) {
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
/**
 * 编码html特殊符号
 * @param {string} text 原字符串
 * @return {string} 处理后的字符串
 */
exports.htmlEscape = function (text) {
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
/**
 * 解码html特殊符号
 * @param {string} text 原字符串
 * @return {string} 处理后的字符串
 */
exports.htmlUnescape = function (text) {
    return text.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"');
};
/**
 * url 编码
 * @param {string} args 原字符串
 * @return {string} 处理后的字符串
 */
exports.urlEncode = function () {
    return UrlEncode.encode.apply(null, arguments);
};
/**
 * url 解码
 * @param {string} args 原字符串
 * @return {string} 处理后的字符串
 */
exports.urlDecode = function () {
    return UrlEncode.decode.apply(null, arguments);
};
/**
 * 构建 querystring 字符串
 * @param {object} args 参数
 * @return {string} 处理后的字符串
 */
exports.buildQueryString = function () {
    return UrlEncode.stringify.apply(null, arguments);
};
/**
 * 解析 querystring 字符串
 * @param {string} args string
 * @return {object} 解析后的参数对象
 */
exports.parseQueryString = function () {
    return UrlEncode.parse.apply(null, arguments);
};
/**
 * 构建成功时的json对象
 * @param {any} data 成功时要返回的数据，默认：null
 * @param {string} message 成功时要返回的消息，默认：'ok'
 * @return {object} json对象
 */
exports.jsonSuccess = (data, message = 'ok') => {
    return { success: true, code: 0, data, message };
};
/**
 * 构建失败时的json对象
 * @param {string} message 失败时的错误消息
 * @param {string} code 失败时的错误代码，默认：'1'
 * @param {any} data 失败时要返回的数据，默认：null
 * @return {object} json对象
 */
exports.jsonError = (message, code = '1', data = null) => {
    return { success: false, code, data, message };
};
