'use strict';

import Nunjucks from 'nunjucks';
import Path from 'path';
import { HpyerTemplateProvider } from '../Support/Types/Hpyer';
import Application from './Application';

export default class Templater {
  app: Application = null;

  provider: string = '';

  constructor(app: Application) {
    this.app = app;
    this.provider = app.config.template.provider || HpyerTemplateProvider.NUNJUCKS;
  }

  /**
   * 设置模版提供商
   * @param {string} provider 模版提供商
   * @retur Templater
   */
  setProvider(provider: string): Templater {
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
        Nunjucks.configure(Path.resolve(this.app.config.root.modules), this.app.config.template.nunjucks);
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
        Nunjucks.configure(Path.resolve(this.app.config.root.errors), this.app.config.template.nunjucks);
        content = Nunjucks.render(this.app.config.template.defaultMessageTpl, opt);
    }
    return content;
  }

};
