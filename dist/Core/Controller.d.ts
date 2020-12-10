import { HashMap } from '../Support/Types/Hpyer';
import { Context } from 'koa';
import Application from './Application';
export default class Controller {
    /**
     * 应用实例，框架会自动注入
     */
    app: Application;
    /**
     * 当前 module 名称，框架会自动注入
     */
    module: string;
    /**
     * 当前 controller 名称，框架会自动注入
     */
    controller: string;
    /**
     * 当前 action 名称，框架会自动注入
     */
    action: string;
    /**
     * 当前 koa 的请求上下文对象，框架会自动注入
     */
    ctx: Context;
    /**
     * 是否 post 请求，框架会自动注入
     */
    isPost: Boolean;
    /**
     * 是否命令行请求，框架会自动注入，无 koa 的请求上下文时为 true
     */
    isCli: Boolean;
    viewParams: HashMap;
    constructor();
    /**
     * 控制器的 action 在执行前的钩子
     */
    __before(): boolean;
    /**
     * 控制器的 action 在执行后的钩子
     */
    __after(): boolean;
    /**
     * 添加模版参数
     * @param  {string} name 参数名
     * @param  {any} value 参数值
     * @return {void}
     */
    assign(name: string | object, value: string): void;
    /**
     * 输出内容
     * @param  {string} content 内容
     * @param  {string} type 参数值，mime类型，默认：text/html
     * @return {void}
     */
    displayContent(content: string, type?: string): void;
    /**
     * 输出模版内容
     * @param  {string} file 模版名称，默认：${module}/${viewDir}/${controller}/${action}.html
     * @param  {object} params 参数，键值对
     * @return {void}
     */
    displayTemplate(file?: string, params?: object): void;
    /**
     * 输出当前应用的模版内容
     * @param  {string} file 模版名称，默认：${controller}/${action}.html
     * @param  {object} params 参数，键值对
     * @param  {string} ext 参数，扩展名
     * @return {void}
     */
    display(file?: string, params?: object, ext?: string): void;
    /**
     * 输出json数据
     * @param  {object} res json对象
     * @return {void}
     */
    json(res: object): void;
    forceAjax(): this;
    isAjax(): boolean;
    /**
     * 输出成功时的结果，ajax请求则输出json，否则输出html
     * @param  {any} data 数据
     * @param  {string} message 消息
     * @return {void}
     */
    success(data?: any, message?: string): boolean;
    /**
     * 输出失败时的结果，ajax请求则输出json，否则输出html
     * @param  {string} message 错误信息
     * @param  {string} code 错误代码
     * @param  {any} data 数据
     * @return {boolean} false表示不再继续执行
     */
    fail(message: string, code?: string, data?: any): boolean;
    /**
     * 文件下载
     * @param  {string} file 文件路径
     * @param  {object} options { autoDelete: 是否自动删除文件，默认：true, root: 文件所在根目录 }
     * @return {void}
     */
    download(file: string, options?: object): Promise<void>;
}
