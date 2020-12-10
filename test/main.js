const assert = require('assert');

const { HpyerApplication, } = require('../dist');

const Package = require('../package.json');

let Hpyer = new HpyerApplication;

let config = {
  entry: __filename,
  port: 1234,
};

describe('Framwork', function () {

  before('Test start.', async function() {
    await Hpyer.start(config);
  });

  after('Test finished.', function() {
    setTimeout(() => {
      process.exit(0);
    }, 0);
  });

  it(`Should instanceof HpyerApplication`, function() {
    assert.strictEqual(Hpyer instanceof HpyerApplication, true);
  });

  it(`Framwork version should be ${ Package.version }`, function() {
    assert.strictEqual(Hpyer.version, Package.version);
  });

  it(`Listen port should be ${ config.port }`, function() {
    assert.strictEqual(Hpyer.config.port, config.port);
  });

});
