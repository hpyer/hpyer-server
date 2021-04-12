import { HashMap, HpyerServerKoaContext } from '../Support/Types/Hpyer';
/**
 * 控制器基类
 */
export default class Controller {
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
    ctx: HpyerServerKoaContext;
    /**
     * 是否 post 请求，框架会自动注入
     */
    isPost: boolean;
    /**
     * 是否命令行请求，框架会自动注入，无 koa 的请求上下文时为 true
     */
    isCli: boolean;
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
     * @param  name 参数名
     * @param  value 参数值
     */
    assign(name: string | object, value: string): void;
    /**
     * 输出内容
     * @param  content 内容
     * @param  type 参数值，mime类型，默认：text/html
     */
    displayContent(content: string, type?: string): void;
    /**
     * 输出模版内容
     * @param  file 模版名称，默认：${module}/${viewDir}/${controller}/${action}.html
     * @param  params 参数，键值对
     */
    displayTemplate(file?: string, params?: object): void;
    /**
     * 输出当前应用的模版内容
     * @param  file 模版名称，默认：${controller}/${action}.html
     * @param  params 参数，键值对
     * @param  ext 参数，扩展名
     */
    display(file?: string, params?: object, ext?: string): void;
    /**
     * 输出json数据
     * @param  res json对象
     */
    json(res: object): void;
    /**
     * 强制为ajax请求
     */
    forceAjax(): this;
    /**
     * 判断当前是否ajax请求
     */
    isAjaxRequest(): boolean;
    /**
     * 输出成功时的结果，ajax请求则输出json，否则输出html
     * @param  data 数据
     * @param  message 消息
     */
    success(data?: any, message?: string): boolean;
    /**
     * 输出失败时的结果，ajax请求则输出json，否则输出html
     * @param  message 错误信息
     * @param  code 错误代码
     * @param  data 数据
     */
    fail(message: string, code?: string, data?: any): boolean;
    /**
     * 文件下载
     * @param  file 文件路径
     * @param  options { autoDelete: 是否自动删除文件，默认：true, root: 文件所在根目录 }
     */
    download(file: string, options?: object): Promise<void>;
}
