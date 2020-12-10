
# hpyer-server 2.x

本项目是本人结合实际项目中的使用情况，提炼出来的 Node.js 的服务端框架。框架采用 Module-MVC 模式，基于 koa2 框架开发，并叠加了其他功能。

> 2.x 用 Typescript 重写，对 vscode 更加友好

## 功能特点

* 基于 Koa2 框架
* 关系数据库操作（暂支持：MySql）
* 缓存操作（暂支持：文件、Redis）
* 视图模版（暂支持：nunjucks）
* 计划任务

## 使用方式

```js
// 引入 hpyer-server 的 HpyerApplication 类
const { HpyerApplication } = require('hpyer-server');

// 相关配置项
let cfg = {
  entry: __filename,
  port: 1234,
  ...
};

// 实例化应用
let Hpyer = new HpyerApplication;

// 启动服务
await Hpyer.start(cfg);
```

## 配置项

详见：[DefaultConfig.js](dist/Support/DefaultConfig.js)
