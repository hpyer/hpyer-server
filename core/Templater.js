'use strict';

const Nunjucks = require('nunjucks');
const Path = require('path');

module.exports = {
  render: function (...args) {
    Nunjucks.configure(Path.resolve(Hpyer.config.root.apps), Hpyer.config.template);
    return Nunjucks.render.apply(this, args);
  },
  renderError: function (opt) {
    Nunjucks.configure(Path.resolve(Hpyer.config.root.errors), Hpyer.config.template);
    return Nunjucks.render(Hpyer.config.template.defaultMessageTpl, opt);
  }
};
