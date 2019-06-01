
# hpyer-server

> 本项目是本人结合实际项目中的使用情况，提炼出来的 Node.js 的服务端框架。框架采用 App-MVC 模式，基于 koa2 开发，并叠加了其他功能。

## 功能特点

* 基于 Koa2 框架
* 关系数据库操作（暂仅支持：MySql）
* 缓存操作（暂支持：文件、Redis）
* 视图模版（暂支持：nunjucks）
* 计划任务

## 使用方式

```js
// 引入 hpyer-server，同时会注入一个全局对象 Hpyer
require('hpyer-server');

// 相关配置项
let cfg = {
  ...
};

// 启动服务
Hpyer.start(cfg);
```

## 配置项

详见：[DefaultConfig.js](DefaultConfig.js)
