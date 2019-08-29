'use strict';

let Cache = {};

Cache.instances = {};

Cache.getInstance = function (provider, options = {}) {
  if (!provider) return null;
  let fetcher = require(__dirname + '/providers/' + provider);
  Cache.instances[provider] = fetcher(options);
  return Cache.instances[provider];
};

module.exports = Cache;
