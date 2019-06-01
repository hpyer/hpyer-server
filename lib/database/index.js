'use strict';

const Utils = require('./libs/Utils');

let DB = {};

DB.instances = {};

DB.getInstance = async function (provider, options = {}) {
  if (!provider) return null;
  let fetcher = require('./providers/' + provider);
  DB.instances[provider] = await fetcher(options);
  return DB.instances[provider];
};

DB.escape = Utils.escape;

DB.parseWhere = Utils.parseWhere;

module.exports = DB;
