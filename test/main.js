const assert = require('assert');

const { HpyerApplication, HpyerConfig } = require('../dist');
require('../dist/Support/Types/Thirdparty');

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
  cache: {
    enable: true,
    provider: 'redis',
    redis: {
      host: '127.0.0.1',
      port: '6379',
      password: '',
    },
  },
  db: {
    enable: true,
    provider: 'mysql',
    mysql: {
      host: '127.0.0.1',
      port: '3306',
      user: 'root',
      password: 'root',
      database: 'test',
      charset: 'utf8mb4',
    },
  },
  koa: {
    routers: [
      { path: '/api/(.*)', middleware: require('./middlewares/api') },
    ],
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
    }, 100);
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

  it(`Visite default controller`, async function() {
    let response = await Hpyer.doRequest({
      url: `http://localhost:${config.port}`,
      method: 'get',
    });

    assert.strictEqual(Hpyer.utils.isMatch(/<h1>CurrentTime\:\s\d{4}\-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}<\/h1>/ig, response), true);
  });

  it(`Visite api controller (with custom middleware)`, async function() {
    let response = await Hpyer.doRequest({
      url: `http://localhost:${config.port}/api/index/index`,
      method: 'get',
    });

    assert.strictEqual(Hpyer.utils.isMatch(/^\d{4}\-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}$/ig, response.data), true);
  });

  it(`Cache operation`, async function() {
    let key = 'TestCacheKey';
    let data = 'TestCacheData';
    await Hpyer.setCache(key, data, 30);

    let dataInCache = await Hpyer.getCache(key);

    assert.strictEqual(dataInCache, data);
  });

  it(`Redis operation`, async function() {
    let key = 'TestRedisKey';
    let data = 'TestRedisData';

    let redis = Hpyer.getRedis();
    await redis.set(key, data, 'EX', 30);

    let dataInCache = await redis.get(key);

    assert.strictEqual(dataInCache, data);
  });

  it(`Mysql operation`, async function () {
    let db = await Hpyer.getDB();

    let table = 'tb_user';
    let data = {
      name: '张三',
      age: 18,
      sex: '男',
      birth_date: '1990-01-01',
    };

    let id = await db.create(table, data, true);

    let user = await db.findOne(table, {
      id: id,
    });

    let res = await db.update(table, {
      name: '李四',
    }, {
      id: id,
    });

    res = await db.delete(table, {
      id: id,
    });

    db.disconnect();

    assert.strictEqual(user.name, data.name);
  });

  it(`Model operation`, async function () {
    const UserModel = Hpyer.model('tb_user');

    let data = {
      name: '张三',
      age: 18,
      sex: '男',
      birth_date: '1990-01-01',
    };

    let id = await UserModel.create(data, true);

    let user = await UserModel.findOne({
      id: id,
    });

    let res = await UserModel.update({
      name: '李四',
    }, {
      id: id,
    });

    res = await UserModel.delete({
      id: id,
    });

    assert.strictEqual(user.name, data.name);
  });

});
