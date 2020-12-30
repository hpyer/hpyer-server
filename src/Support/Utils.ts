'use strict';

import Moment from 'moment';
import Crypto from 'crypto';
import Fs from 'fs';
import Stream from 'stream';
import * as Uuid from 'uuid';
import * as Xss from 'xss';
import * as UrlEncode from 'urlencode';
import { Context } from 'koa';
import Axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import Logger from '../Support/Logger';

/**
 * 扩展对象
 * @param target 目标对象
 * @param args 任意个对象
 */
export const extend = (target = {}, ...args) => {
  let i = 0;
  const length = args.length;
  let options;
  let name;
  let src;
  let copy;
  if (!target) {
    target = isArray(args[0]) ? [] : {};
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
      if (isArray(copy)) {
        target[name] = extend([], copy);
      } else if (isObject(copy)) {
        target[name] = extend(src && isObject(src) ? src : {}, copy);
      } else {
        target[name] = copy;
      }
    }
  }
  return target;
}

/**
 * 克隆变量
 * @param obj 原变量
 */
export const clone = function (obj: any): any {
  // Handle the 3 simple types, and null or undefined
  if (null == obj || "object" != typeof obj) return obj;

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
      copy[i] = clone(obj[i]);
    }
    return copy;
  }

  // Handle Object
  if (obj instanceof Object) {
    let copy = {};
    for (let attr in obj) {
      if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
    }
    return copy;
  }

  throw new Error("Unable to copy obj! Its type isn't supported.");
};

/**
 * 过滤xss
 * @param str 原字符串
 * @param whiteList 允许的标签
 */
export const xssFilter = function (str: string, whiteList: XSS.IWhiteList = {}): string {
  let myxss = new Xss.FilterXSS({
    whiteList: whiteList,        // 白名单为空，表示过滤所有标签
    stripIgnoreTag: true,      // 过滤所有非白名单标签的HTML
    stripIgnoreTagBody: ['script'] // script标签较特殊，需要过滤标签中间的内容
  });

  return myxss.process(str);
};

/**
 * 格式化时间
 * @param format 输出格式，默认：YYYY-MM-DD HH:mm:ss
 * @param datetime 时间对象、字符串等，默认：null 表示当前时间
 * @param offset 时间偏移量数值，正数表示增加，负数表示减少，默认：0 表示不做偏移
 * @param offsetUnit 时间偏移量单位，默认：'seconds'
 */
export const getFormatTime = function (format: string = '', datetime: Moment.MomentInput = null, offset: number = 0, offsetUnit: Moment.unitOfTime.DurationConstructor = 'seconds'): string {
  format = format || 'YYYY-MM-DD HH:mm:ss';

  let obj: Moment.Moment;
  if (isNumber(datetime) || isNumberString(datetime)) {
    obj = Moment.unix(datetime as number);
  }
  else if (datetime) {
    obj = Moment(datetime as Moment.MomentInput);
  }
  else {
    obj = Moment();
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
  let res: string = obj.format(format);
  return res == 'Invalid date' ? '' : res;
}

/**
 * 判断是否时间字符串
 * @param datetime 时间字符串
 */
export const isDateString = function (datetime: string): boolean {
  if (!datetime) return false;
  return Moment(datetime).isValid();
}

/**
 * 获取 Moment 类
 */
export const getMoment = function (): Function {
  return Moment;
}

/**
 * 获取 UUID
 * @param version 版本，可选：v1、v2、v3、v4，默认：v1
 */
export const getUuid = function (version: string = 'v1'): string {
  return Uuid[version]();
}

/**
 * 判断是否 UUID
 * @param str 字符串
 */
export const isUuid = (str: string): boolean => {
  return str && isString(str) && isMatch(/^[a-z0-9]{8}(-[a-z0-9]{4}){3}-[a-z0-9]{12}$/i, str);
}

/**
 * 转成字符串
 * @param data 要转化的数据
 */
export const toString = Object.prototype.toString;

/**
 * 判断是否字符串
 * @param data 要判断的数据
 */
export const isString = (data: any): boolean => {
  return data && toString.call(data) == '[object String]';
}
/**
 * 判断是否数字
 * @param data 要判断的数据
 */
export const isNumber = (data: any): boolean => {
  return data && toString.call(data) == '[object Number]';
}
/**
 * 判断是否数字字符串
 * @param data 要判断的数据
 */
export const isNumberString = (data: any): boolean => {
  return isString(data) && isMatch(/^(-?\d+)(\.\d+)?$/i, data);
}
/**
 * 判断是否对象
 * @param data 要判断的数据
 */
export const isObject = (data: any): boolean => {
  return data && toString.call(data) == '[object Object]';
}
/**
 * 判断是否数组
 * @param data 要判断的数据
 */
export const isArray = (data: any): boolean => {
  return data && toString.call(data) == '[object Array]';
}
/**
 * 判断是否函数
 * @param data 要判断的数据
 */
export const isFunction = (data: any): boolean => {
  return data && (toString.call(data) == '[object Function]' || toString.call(data) == '[object AsyncFunction]');
}
/**
 * 判断是否日期对象
 * @param data 要判断的数据
 */
export const isDate = (data: any): boolean => {
  return data && toString.call(data) == '[object Date]';
}
/**
 * 判断是否为空
 * @param data 要判断的数据
 */
export const isEmpty = (obj: any): boolean => {
  if (obj === undefined || obj === null || obj === '') return true;
  if (isNumber(obj) && isNaN(obj)) return true;
  if (isObject(obj)) {
    for (let key in obj) {
      return false && key;
    }
    return true;
  }
  return false;
}

/**
 * 判断是否符合正则
 * @param reg 正则对象
 * @param str 要验证的字符串
 */
export const isMatch = (reg: RegExp, str: string): boolean => {
  return !!('' + str).match(reg);
}

/**
 * 判断是否存在数组重
 * @param data 要查找的数据
 * @param arr 被查找的数组
 * @param strict 是否严格模式
 */
export const inArray = (data: any, arr: Array<any>, strict = false): boolean => {
  if (!isArray(arr)) return strict ? data === arr : data == arr;
  if (isFunction(arr.findIndex)) {
    return arr.findIndex((o) => { return strict ? o === data : o == data }) > -1;
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
}

/**
 * 去除字符串左右的符号
 * @param str 原字符串
 * @param chars 要去除的符号，正则字符串，默认空白符
 */
export const trim = (str: string, chars = '\\s+'): string => {
  if (!str || !isString(str)) return '';
  return str.replace(new RegExp('^' + chars + '|' + chars + '$', 'gm'), '');
}
/**
 * 去除字符串左边的符号
 * @param str 原字符串
 * @param chars 要去除的符号，正则字符串，默认空白符
 */
export const ltrim = (str: string, chars = '\\s+'): string => {
  if (!str || !isString(str)) return '';
  return str.replace(new RegExp('^' + chars, 'gm'), '');
}
/**
 * 去除字符串右边的符号
 * @param str 原字符串
 * @param chars 要去除的符号，正则字符串，默认空白符
 */
export const rtrim = (str: string, chars = '\\s+'): string => {
  if (!str || !isString(str)) return '';
  return str.replace(new RegExp(chars + '$', 'gm'), '');
}

/**
 * 将字符串复制为多份
 * @param str 要复制的字符串
 * @param num 要复制的次数
 */
export const repeat = (str: string, num: number): string => {
  return new Array(num + 1).join(str);
}

/**
 * 给字符串填充字符
 * @param str 原字符串
 * @param len 要填充到的字符串长度
 * @param chr 要填充的字符
 * @param leftJustify Ture 表示左侧填充，否则反之
 */
export const pad = function (str: string, len: number, chr: string = ' ', leftJustify: boolean = true): string {
  let padding = (str.length >= len) ? '' : repeat(chr, len - str.length >>> 0)
  return leftJustify ? padding + str : str + padding
}

/**
 * 将单词（句子）首字母转成大写，'hello word' => 'Hello World'
 * @param str 要转换的单词（句子）
 */
export const toUpperFirstLetter = function (str: string): string {
  return str.replace(/\b[a-z]/gi, function (letter) {
    return letter.toUpperCase();
  });
};

/**
 * 将单词（句子）首字母转成小写，'Hello World' => 'hello word'
 * @param str 要转换的单词（句子）
 */
export const toLowerFirstLetter = function (str: string): string {
  return str.replace(/\b[a-z]/gi, function (letter) {
    return letter.toLowerCase();
  });
};

/**
 * 字符串驼峰格式（首字母大写），'hello word' => 'HelloWorld'
 * @param str 要转换的字符串
 * @param separator 单词分隔符，默认：'[\\-|\\_]'
 */
export const toStudlyCase = function (str: string, separator: string = '[\\-|\\_]'): string {
  let reg = new RegExp(separator + '(\\w)', 'gi');
  return toUpperFirstLetter(str.replace(reg, ' ')).replace(/\s/gi, '');
};

/**
 * 字符串驼峰格式（首字母小写），'hello word' => 'HelloWorld'
 * @param str 要转换的字符串
 * @param separator 单词分隔符，默认：'[\\-|\\_]'
 */
export const toCamelCase = (str: string, separator: string = '[-|\\_]'): string => {
  return toLowerFirstLetter(toStudlyCase(str, separator));
}

/**
 * 字符串转分割线格式
 * @param str 原字符串
 * @param separator 单词分隔符
 */
export const toLineCase = (str: string, separator: string = '-'): string => {
  return str.replace(/([A-Z])/g, separator + "$1").toLowerCase();
}

/**
 * 获取匹配到的所有字符串
 * @param reg 正则表达式
 * @param str 原字符串
 */
export const matchAll = function (reg: RegExp, string: string): Array<RegExpExecArray> {
  let matched = [];
  let res;
  while ((res = reg.exec(string)) != null) {
    matched.push(res);
  }
  return matched;
};

/**
 * 休眠，暂停代码执行
 * @param time 毫秒数
 */
export const sleep = function (time: number = 0): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
};

/**
 * base64 编码
 * @param str 原字符串
 */
export const base64Encode = function (str: string): string {
  let buffer = Buffer.from(str);
  return buffer.toString('base64');
};

/**
 * base64 解码
 * @param str 原字符串
 */
export const base64Decode = function (str: string): string {
  let buffer = Buffer.from(str, 'base64');
  return buffer.toString();
};

/**
 * 生成 min 到 max 之间的随机数
 * @param max 最大值（不包含）
 * @param min 最小值（包含），默认：0
 */
export const getRandomNumber = function (max: number, min: number = 0): number {
  if (max < 0 || min < 0) {
    throw new Error(`Invalid params. max: ${max}, min: ${min}.`);
  }
  if (max == min) return min;
  max = Math.max(max, min);
  min = Math.min(max, min);
  return min + Math.floor(Math.random() * (max - min));
}

/**
 * 生成随机字符串
 * @param len 生成的随机字符串长度
 * @param type 生成方式，可选：string/password、code/number，默认：string
 */
export const getRandomString = function (len: number = 16, type: string = 'string'): string {
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
    str += chars.charAt(getRandomNumber(chars.length - 1));
  }
  return str;
}

/**
 * 计算哈希字符串
 * @param str 原文字符串
 * @param type 哈希方式，可选：sha1、md5等待，默认：sha1
 * @param target 生成的目标类型，可选：latin1、hex、base64，默认：hex
 */
export const createHash = function (str: string, type: string = 'sha1', target: Crypto.HexBase64Latin1Encoding = 'hex'): string {
  return Crypto.createHash(type).update(str).digest(target);
}

/**
 * 计算加密字符串
 * @param str 原文字符串
 * @param type 加密方式，可选：sha256等待，默认：sha256
 * @param target 生成的目标类型，可选：latin1、hex、base64，默认：hex
 */
export const createHmac = function (str: string, key: string, type: string = 'sha256', target: Crypto.HexBase64Latin1Encoding = 'hex'): string {
  return Crypto.createHmac(type, key).update(str).digest(target);
}

/**
 * 计算文件的 md5 值
 * @param path 文件路径或文件可读流
 */
export const md5File = function (path: string | Stream.Readable): Promise<string> {
  return new Promise((reslove, reject) => {
    let stream;
    if (isString(path)) {
      stream = Fs.createReadStream(path as string);
    }
    else {
      stream = new Stream.PassThrough();
      (path as Stream.Readable).pipe(stream);
    }
    let md5sum = Crypto.createHash('md5');
    stream.on('data', function (chunk) {
      md5sum.update(chunk);
    });
    stream.on('end', function () {
      let str = md5sum.digest('hex').toUpperCase();
      reslove(str);
    });
  });
}

/**
 * 发起http请求
 * @param  payload  Axios请求参数，详见：https://www.npmjs.com/package/axios#request-config
 * @param  returnResponse  是否返回 AxiosResponse 对象，默认：false，表示直接返回 AxiosResponse.data
 */
export const doRequest = function(payload: AxiosRequestConfig, returnResponse: boolean = false): Promise <any> {
  let start_time = (new Date).getTime();
  Logger.info(`doRequest_${start_time}`, payload);

  return Axios.request(payload).then((res: AxiosResponse) => {
    let end_time = (new Date).getTime();
    let log_data = res.data;
    if (payload.responseType == 'stream') {
      log_data = '[ReadableStream]';
    }
    else if (payload.responseType == 'arraybuffer') {
      log_data = '[Buffer]';
    }
    Logger.info(`doRequest.success_${start_time}`, `${end_time - start_time}ms`, log_data);

    return returnResponse ? res : res.data;
  }).catch(err => {
    let end_time = (new Date).getTime();
    Logger.error(`doRequest.error_${start_time}`, `${end_time - start_time}ms`, err.response.status, err.response.data);
    return null;
  });
}

/**
 * 编码html特殊符号
 * @param text 原字符串
 */
export const htmlEscape = function (text: string): string {
  return text.replace(/[<>"&]/g, function (match: string): string {
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
}

/**
 * 解码html特殊符号
 * @param text 原字符串
 */
export const htmlUnescape = function (text: string): string {
  return text.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"');
}

/**
 * url 编码
 * @param args 原字符串
 */
export const urlEncode = function (): string {
  return UrlEncode.encode.apply(null, arguments);
}

/**
 * url 解码
 * @param args 原字符串
 */
export const urlDecode = function (): string {
  return UrlEncode.decode.apply(null, arguments);
}

/**
 * 构建 querystring 字符串
 * @param args 参数
 */
export const buildQueryString = function (): string {
  return UrlEncode.stringify.apply(null, arguments);
}

/**
 * 解析 querystring 字符串
 * @param args string
 */
export const parseQueryString = function (): string {
  return UrlEncode.parse.apply(null, arguments);
}

/**
 * 构建成功时的json对象
 * @param data 成功时要返回的数据，默认：null
 * @param message 成功时要返回的消息，默认：'ok'
 */
export const jsonSuccess = (data: any, message = 'ok'): object => {
  return { success: true, code: 0, data, message };
}

/**
 * 构建失败时的json对象
 * @param message 失败时的错误消息
 * @param code 失败时的错误代码，默认：'1'
 * @param data 失败时要返回的数据，默认：null
 */
export const jsonError = (message: string, code: string = '1', data: any = null): object => {
  return { success: false, code, data, message };
}

/**
 * SQL字符转义
 * @param str 待转义的字符串或字符串数组
 */
export const sqlEscape = function(str: string | Array<string>): Array<string> | string {
  if (isArray(str)) {
    let arr = []
    for (let i=0; i<str.length; i++) {
      arr[i] = sqlEscape(str[i]);
    }
    return arr;
  }
  else {
    return `${(str + '').replace(/(\'|\")/i, '\\$1')}`;
  }
};

/**
 * 解析where查询的值
 * @param k 字段名
 * @param v 字段值
 */
export const parseWhereValue = function(k: string, v: string | Array<string>): string {
  if (isArray(v[1])) {
    // array eg. ['in', ['value1', 'value2', 'value3']]
    if (v[0].toLowerCase() == 'between') {
      return `${k} BETWEEN '${sqlEscape(v[1][0])}' AND '${sqlEscape(v[1][1])}'`;
    }
    else if (v[0].toLowerCase() == 'like') {
      let a = [];
      for (let i = 0; i < v[1].length; i++) {
        a.push(`${k} LIKE '${sqlEscape(v[1][i])}'`);
      }
      return a.join(' OR ');
    }
    else {
      return `${k} ${v[0]} ('${(sqlEscape(v[1]) as Array<string>).join(',')}')`;
    }
  }
  else if (v[0] == 'exp') {
    // array eg. ['exp', sql]
    return `${k} ${v[1]}`;
  }
  else {
    // array eg. ['=', 'value'] or ['like', 'value%']
    return `${k} ${v[0]} ('${sqlEscape(v[1])}')`;
  }
};

/**
 * 解析where查询项
 * @param k 字段名
 * @param v 字段值
 */
export const parseWhereItem = function(k: string, v: string | Array<string | boolean>): string {
  k = k.replace(/\./, '.');
  if (isArray(v) && v.length == 2) {
    return ' AND ' + parseWhereValue(k, v as Array<string>);
  }
  else if (isArray(v) && v.length == 3) {
    // array eg. ['name', 'a', false] or ['name', ['in', ['a', 'b']], 'or']
    let is_and = !(v[2] === false || v[2] == 'OR' || v[2] == 'or');
    return (is_and ? ' AND ' : ' OR ') + parseWhereValue(k, v as Array<string>);
  }
  else {
    return ` AND ${k}='${sqlEscape(v as string)}'`;
  }
};

/**
 * 解析where查询
 * @param where 查询信息
 */
export const parseWhere = function(where: object | Array<string | boolean> | string): string {
  if (!where) return '';

  let whereStrings = [];
  if (isObject(where)) {
    for (let k in where as object) {
      let v = where[k];
      if (k.indexOf('|')) {
        // eg. {'name|account': 'test'}
        let is_and: boolean = true;
        if (isArray(v) && v.length == 3) {
          is_and = !(v[2] === false || v[2] == 'OR' || v[2] == 'or');
        }
        let ks = k.split('|');
        let items = [];
        for (let j = 0; j < ks.length; j++) {
          if (!ks[j]) continue;
          items.push(parseWhereItem(ks[j], v).replace(/^\s(AND|OR)\s/gi, ''));
        }
        whereStrings.push((is_and ? ' AND ' : ' OR ') + '(' + items.join(' OR ') + ')');
      }
      else if (k.indexOf('&')) {
        // eg. {'name&account': 'test'}
        let is_and: boolean = true;
        if (isArray(v) && v.length == 3) {
          is_and = !(v[2] === false || v[2] == 'OR' || v[2] == 'or');
        }
        let ks = k.split('&');
        let items = [];
        for (let j = 0; j < ks.length; j++) {
          if (!ks[j]) continue;
          items.push(parseWhereItem(ks[j], v).replace(/^\s(AND|OR)\s/gi, ''));
        }
        whereStrings.push((is_and ? ' AND ' : ' OR ') + '(' + items.join(' AND ') + ')');
      }
      else {
        whereStrings.push(parseWhereItem(k, v));
      }
    }
  }
  else if (isArray(where)) {
    // array eg. ['`name`=\'a\'', ['`name`=\'b\'', false], ['`status`=1', 'and']]
    for (let i = 0; i < (where as Array<string>).length; i++) {
      let v = where[i];
      if (isArray(v) && v.length == 2) {
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

/**
 * 是否ajax请求
 * @param  ctx  koa的上下文
 */
export const isAjaxRequest = function(ctx: Context): boolean {
  if (ctx.request.is_ajax || (ctx.request.header['x-requested-with'] && ctx.request.header['x-requested-with'] == 'XMLHttpRequest')) {
    return true;
  }
  return false;
};
