'use strict';

const merge = require('merge');
const moment = require('moment');
const uuid = require('uuid');
const crypto = require('crypto');
const fs = require('fs');
const JWT = require('jsonwebtoken');
const got = require('got');
const requestIP = require('request-ip');
const Stream = require('stream');
const xss = require('xss');
const UrlEncode = require('urlencode');

// 过滤xss
const xssFilter = function (str, whiteList = []) {
  let myxss = new xss.FilterXSS({
    whiteList: whiteList,        // 白名单为空，表示过滤所有标签
    stripIgnoreTag: true,      // 过滤所有非白名单标签的HTML
    stripIgnoreTagBody: ['script'] // script标签较特殊，需要过滤标签中间的内容
  });

  return myxss.process(str);
};

const verifyJWT = (token) => {
  try {
    return JWT.verify(token, Hpyer.config.key);
  }
  catch (e) {
    Hpyer.log('verifyJWT_error', e);
    return null;
  }
};

const createJWT = (payload, expiresIn = '12h') => {
  try {
    return JWT.sign(payload, Hpyer.config.key, {expiresIn: expiresIn});
  }
  catch (e) {
    Hpyer.log('createJWT_error', e);
    return null;
  }
};

const getFormatTime = function (datetime = null, format = null, offset = 0, offsetUnit = 'seconds') {
  format = format || 'YYYY-MM-DD HH:mm:ss';

  let obj;
  if (isNumber(datetime) || isNumberString(datetime)) {
    obj = moment.unix(datetime);
  }
  else if (datetime) {
    obj = moment(datetime);
  }
  else {
    obj = moment();
  }

  if (format.toUpperCase() == 'ISO8601') {
    obj = obj.utc();
    format = null;
  }

  if (offset > 0) {
    obj.add(offset, offsetUnit);
  }
  if (offset < 0) {
    obj.subtract(offset, offsetUnit);
  }
  obj = obj.format(format);
  return obj == 'Invalid date' ? '' : obj;
}

const getUnixTime = function (datetime = null) {
  let obj;
  if (isDate(datetime)) {
    obj = moment(datetime);
  }
  else {
    obj = moment();
  }
  return obj.format('X');
}

const getMoment = function () {
  return moment;
}

const getUuid = function (version = 'v1') {
  return uuid[version]();
}
const isUuid = data => {
  return isString(data) && isMatch(/^[a-z0-9]{8}(-[a-z0-9]{4}){3}-[a-z0-9]{12}$/i, data);
}

const toString = Object.prototype.toString;
const isString = data => {
  return data && toString.call(data) == '[object String]';
}
const isNumber = data => {
  return data && toString.call(data) == '[object Number]';
}
const isNumberString = data => {
  return isString(data) && isMatch(/^(-?\d+)(\.\d+)?$/i, data);
}
const isObject = data => {
  return data && toString.call(data) == '[object Object]';
}
const isArray = data => {
  return data && toString.call(data) == '[object Array]';
}
const isFunction = data => {
  return data && toString.call(data) == '[object Function]' || toString.call(data) == '[object AsyncFunction]';
}
const isDate = data => {
  return data && toString.call(data) == '[object Date]';
}
const isEmpty = (obj) => {
  if (obj === undefined || obj === null || obj === '') return true;
  if (isNumber(obj) && isNaN(obj)) return true;
  if (isObject(obj)) {
    for (const key in obj) {
      return false && key;
    }
    return true;
  }
  return false;
}
const isMatch = (reg, str) => {
  return ('' + str).match(reg);
}
const isEmail = function (str) {
  if (!str) return false;
  return isMatch(/^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/, str);
}

const isMobile = function (str) {
  if (!str) return false;
  return isMatch(/^1\d{10}$/, str);
}

const isTel = function (str) {
  if (!str) return false;
  return isMatch(/^0\d{2,3}\-\d{6,8}(\-\d{1,4})?$/, str);
}

const isServiceTel = function (str) {
  if (!str) return false;
  return isMatch(/^[4|8]00[0-9]{7}$/, str);
}

const isIdCard = function (code) {
  if (!code) return '无效身份证号';
  var city = {11:'北京',12:'天津',13:'河北',14:'山西',15:'内蒙古',21:'辽宁',22:'吉林',23:'黑龙江 ',31:'上海',32:'江苏',33:'浙江',34:'安徽',35:'福建',36:'江西',37:'山东',41:'河南',42:'湖北 ',43:'湖南',44:'广东',45:'广西',46:'海南',50:'重庆',51:'四川',52:'贵州',53:'云南',54:'西藏 ',61:'陕西',62:'甘肃',63:'青海',64:'宁夏',65:'新疆',71:'台湾',81:'香港',82:'澳门',91:'国外 '};

  if (!code || !/^\d{6}(18|19|20)?\d{2}(0[1-9]|1[012])(0[1-9]|[12]\d|3[01])\d{3}(\d|X)$/i.test(code)) {
    return '身份证号格式错误';
  }
  else if (!city[code.substr(0,2)]) {
    return '地址编码错误';
  }
  //18位身份证需要验证最后一位校验位
  if (code.length == 18) {
    code = code.split('');
    //∑(ai×Wi)(mod 11)
    //加权因子
    var factor = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
    //校验位
    var parity = [1, 0, 'X', 9, 8, 7, 6, 5, 4, 3, 2];
    var sum = 0;
    var ai = 0;
    var wi = 0;
    for (var i = 0; i < 17; i++) {
      ai = code[i];
      wi = factor[i];
      sum += ai * wi;
    }
    if (parity[sum % 11] != code[17]) {
      return '校验位错误';
    }
  }
  return true;
}

const inArray = (data, arr, strict = false) => {
  if (!isArray(arr)) return strict ? data === arr : data == arr;
  if (isFunction(arr.findIndex)) {
    return arr.findIndex((o) => { return strict ? o === data : o == data}) > -1;
  }
  else {
    let flag = false;
    for (let i=0; i<arr.length; i++) {
      if (strict ? data === arr[i] : data == arr[i]) {
        flag = true;
        break;
      }
    }
    return flag;
  }
}

const trim = (s, chars = '\\s+') => {
  if (!s || !isString(s)) return '';
  return s.replace(new RegExp('^' + chars + '|' + chars + '$', 'gm'), '');
}
const ltrim = (s, chars = '\\s+') => {
  if (!s || !isString(s)) return '';
  return s.replace(new RegExp('^' + chars, 'gm'), '');
}
const rtrim = (s, chars = '\\s+') => {
  if (!s || !isString(s)) return '';
  return s.replace(new RegExp(chars + '$', 'gm'), '');
}

const repeat = (str, num) => {
  return new Array(num + 1).join(str);
}

const pad = function (str, len, chr = ' ', leftJustify = true) {
  var padding = (str.length >= len) ? '' : repeat(chr, len - str.length >>> 0)
  return leftJustify ? padding + str : str + padding
}

// https://github.com/kvz/locutus/blob/master/src/php/strings/sprintf.js
const sprintf = function () {

  var regex = /%%|%(?:(\d+)\$)?((?:[-+#0 ]|'[\s\S])*)(\d+)?(?:\.(\d*))?([\s\S])/g
  var args = arguments
  var i = 0
  var format = args[i++]

  var justify = function (value, prefix, leftJustify, minWidth, padChar) {
    var diff = minWidth - value.length
    if (diff > 0) {
      // when padding with zeros
      // on the left side
      // keep sign (+ or -) in front
      if (!leftJustify && padChar === '0') {
        value = [
          value.slice(0, prefix.length),
          pad('', diff, '0', true),
          value.slice(prefix.length)
        ].join('')
      } else {
        value = pad(value, minWidth, padChar, leftJustify)
      }
    }
    return value
  }

  var _formatBaseX = function (value, base, leftJustify, minWidth, precision, padChar) {
    // Note: casts negative numbers to positive ones
    var number = value >>> 0
    value = pad(number.toString(base), precision || 0, '0', false)
    return justify(value, '', leftJustify, minWidth, padChar)
  }

  // _formatString()
  var _formatString = function (value, leftJustify, minWidth, precision, customPadChar) {
    if (precision !== null && precision !== undefined) {
      value = value.slice(0, precision)
    }
    return justify(value, '', leftJustify, minWidth, customPadChar)
  }

  // doFormat()
  var doFormat = function (substring, argIndex, modifiers, minWidth, precision, specifier) {
    var number, prefix, method, textTransform, value

    if (substring === '%%') {
      return '%'
    }

    // parse modifiers
    var padChar = ' ' // pad with spaces by default
    var leftJustify = false
    var positiveNumberPrefix = ''
    var j, l

    for (j = 0, l = modifiers.length; j < l; j++) {
      switch (modifiers.charAt(j)) {
        case ' ':
        case '0':
          padChar = modifiers.charAt(j)
          break
        case '+':
          positiveNumberPrefix = '+'
          break
        case '-':
          leftJustify = true
          break
        case "'":
          if (j + 1 < l) {
            padChar = modifiers.charAt(j + 1)
            j++
          }
          break
      }
    }

    if (!minWidth) {
      minWidth = 0
    } else {
      minWidth = +minWidth
    }

    if (!isFinite(minWidth)) {
      throw new Error('Width must be finite')
    }

    if (!precision) {
      precision = (specifier === 'd') ? 0 : 'fFeE'.indexOf(specifier) > -1 ? 6 : undefined
    } else {
      precision = +precision
    }

    if (argIndex && +argIndex === 0) {
      throw new Error('Argument number must be greater than zero')
    }

    if (argIndex && +argIndex >= args.length) {
      throw new Error('Too few arguments')
    }

    value = argIndex ? args[+argIndex] : args[i++]

    switch (specifier) {
      case '%':
        return '%'
      case 's':
        return _formatString(value + '', leftJustify, minWidth, precision, padChar)
      case 'c':
        return _formatString(String.fromCharCode(+value), leftJustify, minWidth, precision, padChar)
      case 'b':
        return _formatBaseX(value, 2, leftJustify, minWidth, precision, padChar)
      case 'o':
        return _formatBaseX(value, 8, leftJustify, minWidth, precision, padChar)
      case 'x':
        return _formatBaseX(value, 16, leftJustify, minWidth, precision, padChar)
      case 'X':
        return _formatBaseX(value, 16, leftJustify, minWidth, precision, padChar)
          .toUpperCase()
      case 'u':
        return _formatBaseX(value, 10, leftJustify, minWidth, precision, padChar)
      case 'i':
      case 'd':
        number = +value || 0
        // Plain Math.round doesn't just truncate
        number = Math.round(number - number % 1)
        prefix = number < 0 ? '-' : positiveNumberPrefix
        value = prefix + pad(String(Math.abs(number)), precision, '0', false)

        if (leftJustify && padChar === '0') {
          // can't right-pad 0s on integers
          padChar = ' '
        }
        return justify(value, prefix, leftJustify, minWidth, padChar)
      case 'e':
      case 'E':
      case 'f': // @todo: Should handle locales (as per setlocale)
      case 'F':
      case 'g':
      case 'G':
        number = +value
        prefix = number < 0 ? '-' : positiveNumberPrefix
        method = ['toExponential', 'toFixed', 'toPrecision']['efg'.indexOf(specifier.toLowerCase())]
        textTransform = ['toString', 'toUpperCase']['eEfFgG'.indexOf(specifier) % 2]
        value = prefix + Math.abs(number)[method](precision)
        return justify(value, prefix, leftJustify, minWidth, padChar)[textTransform]()
      default:
        // unknown specifier, consume that char and return empty
        return ''
    }
  }

  try {
    return format.replace(regex, doFormat)
  } catch (err) {
    return false
  }
}

// 字符串转换驼峰格式
const toCamelCase = (s, separator = '[-|\\_]') => {
  let reg = new RegExp(separator + '(\\w)', 'g');
  return s.replace(reg, function(all, letter){
    return letter.toUpperCase();
  });
}
// 字符串转分割线格式
const toLineCase = (s, separator = '-') => {
  return s.replace(/([A-Z])/g, separator + "$1").toLowerCase();
}

const extend = (target = {}, ...args) => {
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

const clone = function (obj) {
  // Handle the 3 simple types, and null or undefined
  if (null == obj || "object" != typeof obj) return obj;

  // Handle Date
  if (obj instanceof Date) {
    var copy = new Date();
    copy.setTime(obj.getTime());
    return copy;
  }

  // Handle Array
  if (obj instanceof Array) {
    var copy = [];
    for (var i = 0, len = obj.length; i < len; ++i) {
      copy[i] = clone(obj[i]);
    }
    return copy;
  }

  // Handle Object
  if (obj instanceof Object) {
    var copy = {};
    for (var attr in obj) {
      if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
    }
    return copy;
  }

  throw new Error("Unable to copy obj! Its type isn't supported.");
};

const matchAll = function (reg, string) {
  let matched = [];
  let res;
  while ((res = reg.exec(string)) != null) {
    matched.push(res);
  }
  return matched;
};

const sleep = function (time = 0) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
};

const base64Encode = function (str) {
  var buffer = new Buffer(str);
  return buffer.toString('base64');
};

const base64Decode = function (str) {
  var buffer = new Buffer(str, 'base64');
  return buffer.toString();
};

const getClientIp = (request) => {
  return requestIP.getClientIp(request);
}

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
    str += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return str;
}

const createHash = function (str, type = 'sha1', target = 'hex') {
  return crypto.createHash(type).update(str).digest(target);
}

const createHmac = function (str, key, type = 'sha256', target = 'hex') {
  return crypto.createHmac(type, key).update(str).digest(target);
}

const md5File = function (path) {
  return new Promise((reslove, reject) => {
    let stream;
    if (isString(path)) {
      stream = fs.createReadStream(path);
    }
    else {
      stream = new Stream.PassThrough();
      path.pipe(stream);
    }
    let md5sum = crypto.createHash('md5');
    stream.on('data', function(chunk) {
      md5sum.update(chunk);
    });
    stream.on('end', function() {
      let str = md5sum.digest('hex').toUpperCase();
      reslove(str);
    });
  });
}

const createUuid = function (str = '', type = 'guid', separator = '-') {
  if (!str) str = randomString(32, 'string');
  let md5 = createHash(str, 'md5');
  let fragments = [];
  fragments.push(md5.substr(0, 8));
  fragments.push(md5.substr(8, 4));
  fragments.push(md5.substr(12, 4));
  if (type == 'guid') {
    fragments.push(md5.substr(16, 4));
    fragments.push(md5.substr(20, 12));
  }
  else {
    fragments.push(md5.substr(16, 16));
  }
  return fragments.join(separator);
}

const htmlEscape = function (text) {
  return text.replace(/[<>"&]/g, function (match, pos, originalText) {
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
  });
}

const htmlUnescape = function (text) {
  return text.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"');
}

const urlEncode = function () {
  return UrlEncode.encode.apply(null, arguments);
}

const urlDecode = function () {
  return UrlEncode.decode.apply(null, arguments);
}

const buildQueryString = function () {
  return UrlEncode.stringify.apply(null, arguments);
}

const parseQueryString = function () {
  return UrlEncode.parse.apply(null, arguments);
}

const jsonSuccess = (data, message = 'ok') => {
  return {success: true, code: 0, data, message};
}

const jsonError = (message, code = 1, data = null) => {
  return {success: false, code, data, message};
}

const doRequest = (payload, returnResponse = false) => {
  let start_time = (new Date).getTime();
  Hpyer.log(`doRequest_${start_time}`, payload);

  if (typeof payload.resolveBodyOnly == 'undefined') {
    payload.resolveBodyOnly = !returnResponse;
  }
  return got(payload).then(res => {
    let end_time = (new Date).getTime();
    Hpyer.log(`doRequest_${start_time}`, `${end_time - start_time}ms`, res);

    // 如果是返回body，且返回类型为text，则尝试解析为JSON
    if (payload.resolveBodyOnly && (!payload.responseType || payload.responseType == 'text')) {
      try {
        res = JSON.parse(res);
      }
      catch (e) {}
    }

    return res;
  });
}

module.exports = {
  merge: merge.recursive,
  xssFilter,
  verifyJWT,
  createJWT,
  getFormatTime,
  getUnixTime,
  getMoment,
  getUuid,
  isUuid,
  isString,
  isNumber,
  isNumberString,
  isObject,
  isArray,
  isFunction,
  isDate,
  isEmpty,
  isMatch,
  isEmail,
  isMobile,
  isTel,
  isServiceTel,
  isIdCard,
  inArray,
  trim,
  ltrim,
  rtrim,
  repeat,
  pad,
  sprintf,
  toCamelCase,
  toLineCase,
  extend,
  clone,
  matchAll,
  sleep,
  base64Encode,
  base64Decode,
  getClientIp,
  getRandomString,
  createHash,
  createHmac,
  md5File,
  createUuid,
  htmlEscape,
  htmlUnescape,
  urlEncode,
  urlDecode,
  buildQueryString,
  parseQueryString,
  jsonSuccess,
  jsonError,
  doRequest,
}
