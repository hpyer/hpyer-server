'use strict';

const InterfaceCache = require(__dirname + '/../interfaces/Cache');

const Redis = require('redis');
const BlueBird = require('bluebird');

BlueBird.promisifyAll(Redis.RedisClient.prototype);
BlueBird.promisifyAll(Redis.Multi.prototype);

class ProviderRedis extends InterfaceCache {
  constructor (options) {
    super();

    this.$client = null;
    try {
      this.$client = Redis.createClient(options);
    }
    catch (e) {
      Hpyer.log('无法创建Redis客户端', e);
    }
  }

  getClient () {
    return this.$client;
  }

  async fetch (id) {
    if (!this.$client) return false;
    let content = null;
    try {
      content = JSON.parse(await this.$client.getAsync(id));
    }
    catch (e) {
      console.log('获取Redis缓存失败', id, e);
      return false;
    }
    return content;
  }

  async contains (id) {
    if (!this.$client) return false;
    try {
      let res = await this.$client.existsAsync(id);
    }
    catch (e) {
      return false;
    }
    return res == 1;
  }

  async save (id, data = null, expireIn = 0) {
    if (!this.$client) return false;
    try {
      if (expireIn > 0) {
        await this.$client.setAsync(id, JSON.stringify(data), 'EX', expireIn);
      }
      else {
        await this.$client.setAsync(id, JSON.stringify(data));
      }
    }
    catch (e) {
      console.log('设置Redis缓存失败', id, data, e);
      return false;
    }
    return true;
  }

  async delete (id) {
    if (!this.$client) return false;
    try {
      let res = await this.$client.delAsync(id);
    }
    catch (e) {
      return false;
    }
    return true;
  }
};

const getConnection = function (options) {
  return new ProviderRedis(options);
}

module.exports = getConnection;
