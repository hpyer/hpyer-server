import { HpyerTemplateProvider } from '../Support/Types/Hpyer';
/**
 * 框架模版
 */
export default class Templater {
    provider: HpyerTemplateProvider;
    constructor(provider?: HpyerTemplateProvider);
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
