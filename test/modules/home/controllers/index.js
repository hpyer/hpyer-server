'use strict';

const { Hpyer, Controller } = require('../../../../dist');

module.exports = class extends Controller {

  async indexAction() {
    let time = Hpyer.utils.getFormatTime('YYYY-MM-DD HH:mm:ss');
    this.assign('time', time);
    this.display();
  }

}
