import { HpyerTemplateProvider } from '../Support/Types/Hpyer';
import Application from './Application';
/**
 * 框架模版
 */
export default class Templater {
    app: Application;
    provider: HpyerTemplateProvider;
    constructor(app: Application, provider?: HpyerTemplateProvider);
    /**
     * 设置模版提供商
     * @param {string} provider 模版提供商
     * @retur Templater
     */
    setProvider(provider: HpyerTemplateProvider): Templater;
    /**
     * 渲染页面
     * @param args
     */
    render(...args: any[]): string;
    /**
     * 渲染错误页面
     * @param {object} opt
     */
    renderError(opt?: object): string;
}
