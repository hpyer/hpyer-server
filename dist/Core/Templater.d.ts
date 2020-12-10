import Application from './Application';
export default class Templater {
    app: Application;
    provider: string;
    constructor(app: Application);
    /**
     * 设置模版提供商
     * @param {string} provider 模版提供商
     * @retur Templater
     */
    setProvider(provider: string): Templater;
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
