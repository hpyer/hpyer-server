'use strict';

const InterfaceCache = require(__dirname + '/../interfaces/Cache');

const path = require('path');
const BlueBird = require('bluebird');
const fs = BlueBird.promisifyAll(require('fs'));

class ProviderFile extends InterfaceCache {
  constructor (options) {
    super();

    let defaultOptions = {
      path: '',
      dirMode: 0o777,
      fileMode: 0o666,
      ext: '.cache'
    };
    this.$options = Hpyer.extend(defaultOptions, options);
    this.$options.path = path.resolve(this.$options.path);
    try {
      fs.accessSync(this.$options.path, fs.constants.R_OK & fs.constants.W_OK);
    }
    catch (e) {
      try {
        fs.mkdirSync(this.$options.path, this.$options.dirMode);
      }
      catch (e) {
        Hpyer.log('无法创建缓存目录：' + this.$options.path);
      }
    }
  }

  getCacheFile (id) {
    return this.$options.path + '/' + id + this.$options.ext;
  }

  getCacheContent(file) {
    let dataItem = JSON.parse(fs.readFileSync(file, {
      encoding: 'utf-8',
      flag: 'r'
    }));
    if (dataItem.expireIn > 0 && dataItem.expireIn < parseInt(Hpyer.getUnixTime())) {
      throw new Error('Cache expired.');
    }
    return dataItem.data;
  }

  async fetch (id) {
    let content = null;
    try {
      let file = this.getCacheFile(id);
      content = this.getCacheContent(file);
    }
    catch (e) {
      content = null;
    }
    return content;
  }

  async contains (id) {
    try {
      let file = this.getCacheFile(id);
      fs.accessSync(file, fs.constants.R_OK & fs.constants.W_OK);

      this.getCacheContent(file);
    }
    catch (e) {
      return false;
    }
    return true;
  }

  async save (id, data = null, expireIn = 0) {
    let file = this.getCacheFile(id);
    try {
      let dataItem = {
        data,
        expireIn: expireIn > 0 ? expireIn + parseInt(Hpyer.getUnixTime()) : 0
      };
      await fs.writeFileAsync(file, JSON.stringify(dataItem), {
        mode: this.$options.fileMode,
        encoding: 'utf-8',
        flag: 'w'
      })
    }
    catch (e) {
      return false;
    }
    return true;
  }

  async delete (id) {
    let file = this.getCacheFile(id);
    try {
      await fs.unlinkAsync(file);
    }
    catch (e) {
      return false;
    }
    return true;
  }
};


const getConnection = function (options) {
  return new ProviderFile(options);
}

module.exports = getConnection;
