'use strict';

const InterfaceCache = require(__dirname + '/../interfaces/Cache');

const Redis = require('redis');
const BlueBird = require('bluebird');

BlueBird.promisifyAll(Redis.RedisClient.prototype);
BlueBird.promisifyAll(Redis.Multi.prototype);

let client = null;

class ProviderRedis extends InterfaceCache {
  constructor(options) {
    super();

    try {
      if (!client) {
        client = Redis.createClient(options);
      }
    }
    catch (e) {
      Hpyer.log('无法创建Redis客户端', e);
    }
  }

  getClient() {
    return client;
  }

  async fetch(id) {
    if (!client) return false;
    let content = null;
    try {
      content = JSON.parse(await client.getAsync(id));
    }
    catch (e) {
      console.log('获取Redis缓存失败', id, e);
      return false;
    }
    return content;
  }

  async contains(id) {
    if (!client) return false;
    let res = null;
    try {
      res = await client.existsAsync(id);
    }
    catch (e) {
      return false;
    }
    return res == 1;
  }

  async save(id, data = null, expireIn = 0) {
    if (!client) return false;
    try {
      if (expireIn > 0) {
        await client.setAsync(id, JSON.stringify(data), 'EX', expireIn);
      }
      else {
        await client.setAsync(id, JSON.stringify(data));
      }
    }
    catch (e) {
      console.log('设置Redis缓存失败', id, data, e);
      return false;
    }
    return true;
  }

  async delete(id) {
    if (!client) return false;
    try {
      await client.delAsync(id);
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
