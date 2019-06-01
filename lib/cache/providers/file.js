'use strict';

const InterfaceCache = require('../interfaces/cache');

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

  async fetch (id) {
    let content = null;
    let file = this.getCacheFile(id);
    try {
      let dataItem = JSON.parse(await fs.readFileAsync(file, {
        encoding: 'utf-8',
        flag: 'r'
      }));

      if (dataItem.expireIn > 0 && dataItem.expireIn < parseInt(Hpyer.getUnixTime())) {
        content = null;
      }
      else {
        content = dataItem.data;
      }
    }
    catch (e) {
      Hpyer.log('无法读取缓存文件：' + file);
      content = null;
    }
    return content;
  }

  async contains (id) {
    let file = this.getCacheFile(id);
    try {
      await fs.accessAsync(file, fs.constants.R_OK & fs.constants.W_OK);
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
      Hpyer.log('无法写入缓存文件：' + file);
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
      Hpyer.log('无法删除缓存文件：' + file);
      return false;
    }
    return true;
  }
};


const getConnection = function (options) {
  return new ProviderFile(options);
}

module.exports = getConnection;
