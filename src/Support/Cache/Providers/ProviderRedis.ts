'use strict';

import IORedis from 'ioredis';
import Logger from '../../Logger';
import ContractCache from '../Contracts/ContractCache';

let client: IORedis.Redis = null;

class ProviderRedis extends ContractCache {

  constructor(options: IORedis.RedisOptions) {
    super();

    try {
      if (!client) {
        client = new IORedis(options);
      }
    }
    catch (e) {
      Logger.error(`Fail to create Redis client.`, e);
    }
  }

  async get(id: string): Promise<any> {
    if (!client) return null;
    let content = null;
    try {
      content = JSON.parse(await client.get(id));
    }
    catch (e) {
      Logger.info(`Fail to get content via key '${id}'`, e);
      return null;
    }
    return content;
  }

  async has(id: string): Promise<boolean> {
    if (!client) return false;
    let res = 0;
    try {
      res = await client.exists(id);
    }
    catch (e) {
      return false;
    }
    return res == 1;
  }

  async set(id: string, data: any = null, expireIn: number = 0): Promise<boolean> {
    if (!client) return false;
    try {
      if (expireIn > 0) {
        await client.set(id, JSON.stringify(data), 'EX', expireIn);
      }
      else {
        await client.set(id, JSON.stringify(data));
      }
    }
    catch (e) {
      Logger.info(`Fail to set content via key '${id}' with: `, data, e);
      return false;
    }
    return true;
  }

  async del(id: string): Promise<boolean> {
    if (!client) return false;
    try {
      await client.del(id);
    }
    catch (e) {
      return false;
    }
    return true;
  }

}

const getCacher = function (options): ContractCache {
  return new ProviderRedis(options);
}

export default getCacher;
