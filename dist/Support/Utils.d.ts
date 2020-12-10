import Moment from 'moment';
import Crypto from 'crypto';
import Stream from 'stream';
/**
 * 扩展对象
 * @param {object} target 目标对象
 * @param {object} args 任意个对象
 * @return {object}
 */
export declare const extend: (target?: {}, ...args: any[]) => {};
/**
 * 克隆变量
 * @param {any} obj 原变量
 * @return {any}
 */
export declare const clone: (obj: any) => any;
/**
 * 过滤xss
 * @param {string} str 原字符串
 * @param {XSS.IWhiteList} whiteList 允许的标签
 * @return {string} 过滤后的字符串
 */
export declare const xssFilter: (str: string, whiteList?: XSS.IWhiteList) => string;
/**
 * 格式化时间
 * @param {string} format 输出格式
 * @param {Moment.MomentInput} datetime 时间对象、字符串等
 * @param {number} offset 时间偏移量数值，正数表示增加，负数表示减少
 * @param {Moment.unitOfTime.DurationConstructor} offsetUnit 时间偏移量单位，默认：'seconds'
 * @return {string} 格式化后的时间字符串
 */
export declare const getFormatTime: (format?: string, datetime?: Moment.MomentInput, offset?: number, offsetUnit?: Moment.unitOfTime.DurationConstructor) => string;
/**
 * 判断是否时间字符串
 * @param {string} datetime 时间字符串
 * @return {boolean} True 表示格式正确
 */
export declare const isDateString: (datetime: string) => boolean;
/**
 * 获取 Moment 类
 * @return {Function} Moment 类
 */
export declare const getMoment: () => Function;
/**
 * 获取 UUID
 * @return {string} version 版本，可选：v1、v2、v3、v4，默认：v1
 */
export declare const getUuid: (version?: string) => string;
/**
 * 判断是否 UUID
 * @param {string} version 版本，可选：v1、v2、v3、v4，默认：v1
 * @return {boolean} True 表示格式正确
 */
export declare const isUuid: (str: string) => boolean;
/**
 * 转成字符串
 * @param {any} args 要转化的数据
 * @return {string} 转化后的字符串
 */
export declare const toString: () => string;
/**
 * 判断是否字符串
 * @param {any} data 要判断的数据
 * @return {boolean} True 表示格式正确
 */
export declare const isString: (data: any) => boolean;
/**
 * 判断是否数字
 * @param {any} data 要判断的数据
 * @return {boolean} True 表示格式正确
 */
export declare const isNumber: (data: any) => boolean;
/**
 * 判断是否数字字符串
 * @param {any} data 要判断的数据
 * @return {boolean} True 表示格式正确
 */
export declare const isNumberString: (data: any) => boolean;
/**
 * 判断是否对象
 * @param {any} data 要判断的数据
 * @return {boolean} True 表示格式正确
 */
export declare const isObject: (data: any) => boolean;
/**
 * 判断是否数组
 * @param {any} data 要判断的数据
 * @return {boolean} True 表示格式正确
 */
export declare const isArray: (data: any) => boolean;
/**
 * 判断是否函数
 * @param {any} data 要判断的数据
 * @return {boolean} True 表示格式正确
 */
export declare const isFunction: (data: any) => boolean;
/**
 * 判断是否日期对象
 * @param {any} data 要判断的数据
 * @return {boolean} True 表示格式正确
 */
export declare const isDate: (data: any) => boolean;
/**
 * 判断是否为空
 * @param {any} data 要判断的数据
 * @return {boolean} True 表示格式正确
 */
export declare const isEmpty: (obj: any) => boolean;
/**
 * 判断是否符合正则
 * @param {RegExp} reg 正则对象
 * @param {string} str 要验证的字符串
 * @return {boolean} True 表示符合
 */
export declare const isMatch: (reg: RegExp, str: string) => boolean;
/**
 * 判断是否存在数组重
 * @param {any} data 要查找的数据
 * @param {array} arr 被查找的数组
 * @param {boolean} strict 是否严格模式
 * @return {boolean} True 表示存在
 */
export declare const inArray: (data: any, arr: Array<any>, strict?: boolean) => boolean;
/**
 * 去除字符串左右的符号
 * @param {string} str 原字符串
 * @param {string} chars 要去除的符号，正则字符串，默认空白符
 * @return {string} 过滤后的字符串
 */
export declare const trim: (str: string, chars?: string) => string;
/**
 * 去除字符串左边的符号
 * @param {string} str 原字符串
 * @param {string} chars 要去除的符号，正则字符串，默认空白符
 * @return {string} 过滤后的字符串
 */
export declare const ltrim: (str: string, chars?: string) => string;
/**
 * 去除字符串右边的符号
 * @param {string} str 原字符串
 * @param {string} chars 要去除的符号，正则字符串，默认空白符
 * @return {string} 过滤后的字符串
 */
export declare const rtrim: (str: string, chars?: string) => string;
/**
 * 将字符串复制为多份
 * @param {string} str 要复制的字符串
 * @param {number} num 要复制的次数
 * @return {string} 处理后的字符串
 */
export declare const repeat: (str: string, num: number) => string;
/**
 * 给字符串填充字符
 * @param {string} str 原字符串
 * @param {number} len 要填充到的字符串长度
 * @param {char} chr 要填充的字符
 * @param {boolean} leftJustify Ture 表示左侧填充，否则反之
 * @return {string} 处理后的字符串
 */
export declare const pad: (str: string, len: number, chr?: string, leftJustify?: boolean) => string;
/**
 * 字符串转换驼峰格式
 * @param {string} str 原字符串
 * @param {string} separator 单词分隔符
 * @return {string} 处理后的字符串
 */
export declare const toCamelCase: (str: string, separator?: string) => string;
/**
 * 字符串转分割线格式
 * @param {string} str 原字符串
 * @param {string} separator 单词分隔符
 * @return {string} 处理后的字符串
 */
export declare const toLineCase: (str: string, separator?: string) => string;
/**
 * 获取匹配到的所有字符串
 * @param {RegExp} reg 正则表达式
 * @param {string} str 原字符串
 * @return {array} 匹配到的结果
 */
export declare const matchAll: (reg: RegExp, string: string) => Array<RegExpExecArray>;
/**
 * 休眠，暂停代码执行
 * @param {number} time 毫秒数
 * @return {Promise<void>} 无
 */
export declare const sleep: (time?: number) => Promise<void>;
/**
 * base64 编码
 * @param {string} str 原字符串
 * @return {string} 处理后的字符串
 */
export declare const base64Encode: (str: string) => string;
/**
 * base64 解码
 * @param {string} str 原字符串
 * @return {string} 处理后的字符串
 */
export declare const base64Decode: (str: string) => string;
/**
 * 生成 min 到 max 之间的随机数
 * @param {number} max 最大值（不包含）
 * @param {number} min 最小值（包含），默认：0
 * @return {number} 随机数
 */
export declare const getRandomNumber: (max: number, min?: number) => number;
/**
 * 生成随机字符串
 * @param {number} len 生成的随机字符串长度
 * @param {string} type 生成方式，可选：string/password、code/number，默认：string
 * @return {string} 随机字符串
 */
export declare const getRandomString: (len?: number, type?: string) => string;
/**
 * 计算哈希字符串
 * @param {string} str 原文字符串
 * @param {string} type 哈希方式，可选：sha1、md5等待，默认：sha1
 * @param {string} target 生成的目标类型，可选：latin1、hex、base64，默认：hex
 * @return {string} 哈希字符串
 */
export declare const createHash: (str: string, type?: string, target?: Crypto.HexBase64Latin1Encoding) => string;
/**
 * 计算加密字符串
 * @param {string} str 原文字符串
 * @param {string} type 加密方式，可选：sha256等待，默认：sha256
 * @param {string} target 生成的目标类型，可选：latin1、hex、base64，默认：hex
 * @return {string} 加密字符串
 */
export declare const createHmac: (str: string, key: string, type?: string, target?: Crypto.HexBase64Latin1Encoding) => string;
/**
 * 计算文件的 md5 值
 * @param {string | Stream.Readable} path 文件路径或文件可读流
 * @return {Promise<string>} md5字符串
 */
export declare const md5File: (path: string | Stream.Readable) => Promise<string>;
/**
 * 编码html特殊符号
 * @param {string} text 原字符串
 * @return {string} 处理后的字符串
 */
export declare const htmlEscape: (text: string) => string;
/**
 * 解码html特殊符号
 * @param {string} text 原字符串
 * @return {string} 处理后的字符串
 */
export declare const htmlUnescape: (text: string) => string;
/**
 * url 编码
 * @param {string} args 原字符串
 * @return {string} 处理后的字符串
 */
export declare const urlEncode: () => string;
/**
 * url 解码
 * @param {string} args 原字符串
 * @return {string} 处理后的字符串
 */
export declare const urlDecode: () => string;
/**
 * 构建 querystring 字符串
 * @param {object} args 参数
 * @return {string} 处理后的字符串
 */
export declare const buildQueryString: () => string;
/**
 * 解析 querystring 字符串
 * @param {string} args string
 * @return {object} 解析后的参数对象
 */
export declare const parseQueryString: () => string;
/**
 * 构建成功时的json对象
 * @param {any} data 成功时要返回的数据，默认：null
 * @param {string} message 成功时要返回的消息，默认：'ok'
 * @return {object} json对象
 */
export declare const jsonSuccess: (data: any, message?: string) => object;
/**
 * 构建失败时的json对象
 * @param {string} message 失败时的错误消息
 * @param {string} code 失败时的错误代码，默认：'1'
 * @param {any} data 失败时要返回的数据，默认：null
 * @return {object} json对象
 */
export declare const jsonError: (message: string, code?: string, data?: any) => object;
