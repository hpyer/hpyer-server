'use strict';

const merge = require('merge');
const moment = require('moment');
const uuid = require('uuid');
const crypto = require('crypto');
const fs = require('fs');
const JWT = require('jsonwebtoken');
const request = require('request');
const requestIP = require('request-ip');
const Stream = require('stream');
const xss = require('xss');

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

const jsonSuccess = (data, message = 'ok') => {
  return {success: true, code: 0, data, message};
}

const jsonError = (message, code = 1, data = null) => {
  return {success: false, code, data, message};
}

const doRequest = (payload, returnResponse = false) => {
  return new Promise((resolve, reject) => {
    request(
      payload,
      function (error, response, body) {
        if (error) {
          reject(error);
        }
        else {
          if (returnResponse) {
            Hpyer.log('doRequest_1', payload, response);
            resolve(response);
          }
          else {
            Hpyer.log('doRequest', payload, body);
            try {
              body = JSON.parse(body);
            }
            catch (e) { }
            resolve(body);
          }
        }
      }
    );
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
  jsonSuccess,
  jsonError,
  doRequest,
}
