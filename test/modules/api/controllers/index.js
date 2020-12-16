'use strict';

const { HpyerController } = require('../../../../dist');

module.exports = class extends HpyerController {

  async indexAction() {
    let time = this.app.utils.getFormatTime('YYYY-MM-DD HH:mm:ss');
    this.success(time);
  }

}
