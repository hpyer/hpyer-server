const assert = require('assert');

const { HpyerApplication, HpyerConfig } = require('../dist');

const Package = require('../package.json');
const Path = require('path');

let Hpyer = new HpyerApplication;

let config = new HpyerConfig({
  key: 'HpyerServerTest',
  env: 'develop',
  port: 1234,
  root: {
    modules: Path.resolve(__dirname + '/modules/') + '/',
    errors: Path.resolve(__dirname + '/errors/') + '/',
    models: Path.resolve(__dirname + '/models/') + '/',
    services: Path.resolve(__dirname + '/services/') + '/',
    temp: Path.resolve(__dirname + '/runtime/temp/') + '/',
  },
});

describe('Framwork', function () {

  before('Test start.', async function() {
    Hpyer.log.setLevel(Hpyer.log.levels.ERROR);
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

  it(`Visite default controller.`, async function() {
    let response = await Hpyer.doRequest({
      url: `http://localhost:${config.port}`,
      method: 'get',
    });

    assert.strictEqual(Hpyer.utils.isMatch(/<h1>CurrentTime\:\s\d{4}\-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}<\/h1>/ig, response), true);
  });

});
