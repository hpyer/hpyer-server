"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HpyerTemplateProvider = exports.HpyerCacheProvider = exports.HpyerDbProvider = exports.HpyerApplicationEnv = void 0;
var HpyerApplicationEnv;
(function (HpyerApplicationEnv) {
    HpyerApplicationEnv["DEVELOPMENT"] = "development";
    HpyerApplicationEnv["TEST"] = "test";
    HpyerApplicationEnv["STAGING"] = "staging";
    HpyerApplicationEnv["PRODUCTION"] = "production";
})(HpyerApplicationEnv = exports.HpyerApplicationEnv || (exports.HpyerApplicationEnv = {}));
var HpyerDbProvider;
(function (HpyerDbProvider) {
    HpyerDbProvider["MYSQL"] = "mysql";
})(HpyerDbProvider = exports.HpyerDbProvider || (exports.HpyerDbProvider = {}));
var HpyerCacheProvider;
(function (HpyerCacheProvider) {
    HpyerCacheProvider["FILE"] = "file";
    HpyerCacheProvider["REDIS"] = "redis";
})(HpyerCacheProvider = exports.HpyerCacheProvider || (exports.HpyerCacheProvider = {}));
var HpyerTemplateProvider;
(function (HpyerTemplateProvider) {
    HpyerTemplateProvider["NUNJUCKS"] = "nunjucks";
})(HpyerTemplateProvider = exports.HpyerTemplateProvider || (exports.HpyerTemplateProvider = {}));
;
