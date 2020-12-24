import Moment from 'moment';
import Crypto from 'crypto';
import Stream from 'stream';
import { Context } from 'koa';
/**
 * 扩展对象
 * @param target 目标对象
 * @param args 任意个对象
 */
export declare const extend: (target?: {}, ...args: any[]) => {};
/**
 * 克隆变量
 * @param obj 原变量
 */
export declare const clone: (obj: any) => any;
/**
 * 过滤xss
 * @param str 原字符串
 * @param whiteList 允许的标签
 */
export declare const xssFilter: (str: string, whiteList?: XSS.IWhiteList) => string;
/**
 * 格式化时间
 * @param format 输出格式，默认：YYYY-MM-DD HH:mm:ss
 * @param datetime 时间对象、字符串等，默认：null 表示当前时间
 * @param offset 时间偏移量数值，正数表示增加，负数表示减少，默认：0 表示不做偏移
 * @param offsetUnit 时间偏移量单位，默认：'seconds'
 */
export declare const getFormatTime: (format?: string, datetime?: Moment.MomentInput, offset?: number, offsetUnit?: Moment.unitOfTime.DurationConstructor) => string;
/**
 * 判断是否时间字符串
 * @param datetime 时间字符串
 */
export declare const isDateString: (datetime: string) => boolean;
/**
 * 获取 Moment 类
 */
export declare const getMoment: () => Function;
/**
 * 获取 UUID
 * @param version 版本，可选：v1、v2、v3、v4，默认：v1
 */
export declare const getUuid: (version?: string) => string;
/**
 * 判断是否 UUID
 * @param str 字符串
 */
export declare const isUuid: (str: string) => boolean;
/**
 * 转成字符串
 * @param data 要转化的数据
 */
export declare const toString: () => string;
/**
 * 判断是否字符串
 * @param data 要判断的数据
 */
export declare const isString: (data: any) => boolean;
/**
 * 判断是否数字
 * @param data 要判断的数据
 */
export declare const isNumber: (data: any) => boolean;
/**
 * 判断是否数字字符串
 * @param data 要判断的数据
 */
export declare const isNumberString: (data: any) => boolean;
/**
 * 判断是否对象
 * @param data 要判断的数据
 */
export declare const isObject: (data: any) => boolean;
/**
 * 判断是否数组
 * @param data 要判断的数据
 */
export declare const isArray: (data: any) => boolean;
/**
 * 判断是否函数
 * @param data 要判断的数据
 */
export declare const isFunction: (data: any) => boolean;
/**
 * 判断是否日期对象
 * @param data 要判断的数据
 */
export declare const isDate: (data: any) => boolean;
/**
 * 判断是否为空
 * @param data 要判断的数据
 */
export declare const isEmpty: (obj: any) => boolean;
/**
 * 判断是否符合正则
 * @param reg 正则对象
 * @param str 要验证的字符串
 */
export declare const isMatch: (reg: RegExp, str: string) => boolean;
/**
 * 判断是否存在数组重
 * @param data 要查找的数据
 * @param arr 被查找的数组
 * @param strict 是否严格模式
 */
export declare const inArray: (data: any, arr: Array<any>, strict?: boolean) => boolean;
/**
 * 去除字符串左右的符号
 * @param str 原字符串
 * @param chars 要去除的符号，正则字符串，默认空白符
 */
export declare const trim: (str: string, chars?: string) => string;
/**
 * 去除字符串左边的符号
 * @param str 原字符串
 * @param chars 要去除的符号，正则字符串，默认空白符
 */
export declare const ltrim: (str: string, chars?: string) => string;
/**
 * 去除字符串右边的符号
 * @param str 原字符串
 * @param chars 要去除的符号，正则字符串，默认空白符
 */
export declare const rtrim: (str: string, chars?: string) => string;
/**
 * 将字符串复制为多份
 * @param str 要复制的字符串
 * @param num 要复制的次数
 */
export declare const repeat: (str: string, num: number) => string;
/**
 * 给字符串填充字符
 * @param str 原字符串
 * @param len 要填充到的字符串长度
 * @param chr 要填充的字符
 * @param leftJustify Ture 表示左侧填充，否则反之
 */
export declare const pad: (str: string, len: number, chr?: string, leftJustify?: boolean) => string;
/**
 * 将单词（句子）首字母转成大写，'hello word' => 'Hello World'
 * @param str 要转换的单词（句子）
 */
export declare const toUpperFirstLetter: (str: string) => string;
/**
 * 将单词（句子）首字母转成小写，'Hello World' => 'hello word'
 * @param str 要转换的单词（句子）
 */
export declare const toLowerFirstLetter: (str: string) => string;
/**
 * 字符串驼峰格式（首字母大写），'hello word' => 'HelloWorld'
 * @param str 要转换的字符串
 * @param separator 单词分隔符，默认：'[\\-|\\_]'
 */
export declare const toStudlyCase: (str: string, separator?: string) => string;
/**
 * 字符串驼峰格式（首字母小写），'hello word' => 'HelloWorld'
 * @param str 要转换的字符串
 * @param separator 单词分隔符，默认：'[\\-|\\_]'
 */
export declare const toCamelCase: (str: string, separator?: string) => string;
/**
 * 字符串转分割线格式
 * @param str 原字符串
 * @param separator 单词分隔符
 */
export declare const toLineCase: (str: string, separator?: string) => string;
/**
 * 获取匹配到的所有字符串
 * @param reg 正则表达式
 * @param str 原字符串
 */
export declare const matchAll: (reg: RegExp, string: string) => Array<RegExpExecArray>;
/**
 * 休眠，暂停代码执行
 * @param time 毫秒数
 */
export declare const sleep: (time?: number) => Promise<void>;
/**
 * base64 编码
 * @param str 原字符串
 */
export declare const base64Encode: (str: string) => string;
/**
 * base64 解码
 * @param str 原字符串
 */
export declare const base64Decode: (str: string) => string;
/**
 * 生成 min 到 max 之间的随机数
 * @param max 最大值（不包含）
 * @param min 最小值（包含），默认：0
 */
export declare const getRandomNumber: (max: number, min?: number) => number;
/**
 * 生成随机字符串
 * @param len 生成的随机字符串长度
 * @param type 生成方式，可选：string/password、code/number，默认：string
 */
export declare const getRandomString: (len?: number, type?: string) => string;
/**
 * 计算哈希字符串
 * @param str 原文字符串
 * @param type 哈希方式，可选：sha1、md5等待，默认：sha1
 * @param target 生成的目标类型，可选：latin1、hex、base64，默认：hex
 */
export declare const createHash: (str: string, type?: string, target?: Crypto.HexBase64Latin1Encoding) => string;
/**
 * 计算加密字符串
 * @param str 原文字符串
 * @param type 加密方式，可选：sha256等待，默认：sha256
 * @param target 生成的目标类型，可选：latin1、hex、base64，默认：hex
 */
export declare const createHmac: (str: string, key: string, type?: string, target?: Crypto.HexBase64Latin1Encoding) => string;
/**
 * 计算文件的 md5 值
 * @param path 文件路径或文件可读流
 */
export declare const md5File: (path: string | Stream.Readable) => Promise<string>;
/**
 * 编码html特殊符号
 * @param text 原字符串
 */
export declare const htmlEscape: (text: string) => string;
/**
 * 解码html特殊符号
 * @param text 原字符串
 */
export declare const htmlUnescape: (text: string) => string;
/**
 * url 编码
 * @param args 原字符串
 */
export declare const urlEncode: () => string;
/**
 * url 解码
 * @param args 原字符串
 */
export declare const urlDecode: () => string;
/**
 * 构建 querystring 字符串
 * @param args 参数
 */
export declare const buildQueryString: () => string;
/**
 * 解析 querystring 字符串
 * @param args string
 */
export declare const parseQueryString: () => string;
/**
 * 构建成功时的json对象
 * @param data 成功时要返回的数据，默认：null
 * @param message 成功时要返回的消息，默认：'ok'
 */
export declare const jsonSuccess: (data: any, message?: string) => object;
/**
 * 构建失败时的json对象
 * @param message 失败时的错误消息
 * @param code 失败时的错误代码，默认：'1'
 * @param data 失败时要返回的数据，默认：null
 */
export declare const jsonError: (message: string, code?: string, data?: any) => object;
/**
 * SQL字符转义
 * @param str 待转义的字符串或字符串数组
 */
export declare const sqlEscape: (str: string | Array<string>) => Array<string> | string;
/**
 * 解析where查询的值
 * @param k 字段名
 * @param v 字段值
 */
export declare const parseWhereValue: (k: string, v: string | Array<string>) => string;
/**
 * 解析where查询项
 * @param k 字段名
 * @param v 字段值
 */
export declare const parseWhereItem: (k: string, v: string | Array<string | boolean>) => string;
/**
 * 解析where查询
 * @param where 查询信息
 */
export declare const parseWhere: (where: object | Array<string | boolean> | string) => string;
/**
 * 是否ajax请求
 * @param  ctx  koa的上下文
 */
export declare const isAjaxRequest: (ctx: Context) => boolean;
