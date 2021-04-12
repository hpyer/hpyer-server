'use strict';

import Nunjucks from 'nunjucks';
import Path from 'path';
import { HpyerTemplateProvider } from '../Support/Types/Hpyer';
import { config } from './Application';

/**
 * 框架模版
 */
export default class Templater {
  provider: HpyerTemplateProvider = null;

  constructor(provider: HpyerTemplateProvider = null) {
    this.provider = provider || config.template.provider || HpyerTemplateProvider.NUNJUCKS;
  }

  /**
   * 设置模版提供商
   * @param {string} provider 模版提供商
   * @retur Templater
   */
  setProvider(provider: HpyerTemplateProvider): Templater {
    this.provider = provider;
    return this;
  }

  /**
   * 渲染页面
   * @param args
   */
  render (...args): string {
    let content: string = '';
    switch (this.provider) {
      case HpyerTemplateProvider.NUNJUCKS:
      default:
        Nunjucks.configure(Path.resolve(config.root.modules), config.template.nunjucks);
        content = Nunjucks.render.apply(this, args);
    }
    return content;
  }

  /**
   * 渲染错误页面
   * @param {object} opt
   */
  renderError(opt: object = null): string {
    let content: string = '';
    switch (this.provider) {
      case HpyerTemplateProvider.NUNJUCKS:
      default:
        Nunjucks.configure(Path.resolve(config.root.errors), config.template.nunjucks);
        content = Nunjucks.render(config.template.defaultMessageTpl, opt);
    }
    return content;
  }

};
