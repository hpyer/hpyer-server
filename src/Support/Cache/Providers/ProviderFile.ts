'use strict';

import Path from 'path';
import Fs from 'fs';
// import BlueBird from 'bluebird';
import LogLevel from 'loglevel';
import * as Utils from '../../Utils';
import ContractCache from '../Contracts/ContractCache';
import { HpyerConfigCacheFileOptions } from '../../Types/Hpyer'

// const _Fs = BlueBird.promisifyAll(Fs);

export const DefaultCacheFileOptions: HpyerConfigCacheFileOptions = {
  path: '',
  dirMode: 0o777,
  fileMode: 0o666,
  ext: '.cache',
};

class ProviderFile extends ContractCache {

  options: HpyerConfigCacheFileOptions = null;

  constructor(options: HpyerConfigCacheFileOptions) {
    super();

    this.options = Utils.extend({}, DefaultCacheFileOptions, options) as HpyerConfigCacheFileOptions;
    this.options.path = Path.resolve(this.options.path);
    try {
      Fs.accessSync(this.options.path, Fs.constants.R_OK & Fs.constants.W_OK);
    }
    catch (e) {
      try {
        Fs.mkdirSync(this.options.path, this.options.dirMode);
      }
      catch (e) {
        LogLevel.error(`Fail to create folder for cache. Path: ${this.options.path}`);
      }
    }
  }

  private getCacheFile(id: string): string {
    return this.options.path + '/' + id + this.options.ext;
  }

  private getCacheContent(file: string): any {
    let dataItem = JSON.parse(Fs.readFileSync(file, {
      encoding: 'utf-8',
      flag: 'r'
    }));
    if (dataItem.expireIn > 0 && dataItem.expireIn < parseInt(Utils.getFormatTime('x'))) {
      throw new Error('Cache expired.');
    }
    return dataItem.data;
  }

  async get(id: string): Promise<any> {
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

  async has(id: string): Promise<boolean> {
    try {
      let file = this.getCacheFile(id);
      Fs.accessSync(file, Fs.constants.R_OK & Fs.constants.W_OK);

      this.getCacheContent(file);
    }
    catch (e) {
      return false;
    }
    return true;
  }

  async set(id: string, data: any = null, expireIn: number = 0): Promise<boolean> {
    let file = this.getCacheFile(id);
    try {
      let dataItem = {
        data,
        expireIn: expireIn > 0 ? expireIn + parseInt(Utils.getFormatTime('x')) : 0
      };
      Fs.writeFileSync(file, JSON.stringify(dataItem), {
        mode: this.options.fileMode,
        encoding: 'utf-8',
        flag: 'w'
      })
    }
    catch (e) {
      return false;
    }
    return true;
  }

  async del(id: string): Promise<boolean> {
    let file = this.getCacheFile(id);
    try {
      Fs.unlinkSync(file);
    }
    catch (e) {
      return false;
    }
    return true;
  }

}

const getCacher = function (options): ContractCache {
  return new ProviderFile(options);
}

export default getCacher;
