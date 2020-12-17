'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Hpyer_1 = require("./Types/Hpyer");
const Config_1 = __importDefault(require("./Config"));
const DefaultConfig = new Config_1.default({
    port: '8001',
    key: 'HpyerServer',
    env: Hpyer_1.HpyerApplicationEnv.DEVELOPMENT,
    defaultModelDir: 'models',
    defaultControllerDir: 'controllers',
    defaultViewDir: 'views',
    defaultModuleName: 'home',
    defaultControllerName: 'index',
    defaultActionName: 'index',
    root: {
        modules: './modules/',
        models: './models/',
        services: './services/',
        errors: './errors/',
    },
    uniqueId: {
        cacheKey: 'HpyerUniqueId',
        epoch: 0,
    },
    koa: {
        body: {
            includeUnparsed: false,
            multipart: true,
            jsonLimit: '10mb',
            formLimit: '20mb',
            textLimit: '20mb',
            xmlLimit: '20mb',
        },
        session: {
            key: 'KOA_SESSION:HpyerServer',
            maxAge: 86400000,
            overwrite: true,
            httpOnly: true,
            signed: true,
            rolling: false,
            renew: false,
        },
        statics: [
            '/public/',
        ],
        routers: [],
    },
    db: {
        enable: false,
        provider: Hpyer_1.HpyerDbProvider.MYSQL,
        mysql: {
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'test',
            charset: 'utf8mb4_unicode_ci'
        },
    },
    cache: {
        enable: false,
        provider: Hpyer_1.HpyerCacheProvider.FILE,
        file: {
            path: './runtime/cache/',
            dirMode: 0o777,
            fileMode: 0o666,
            ext: '.cache'
        },
        redis: {
            host: 'localhost',
            port: 6379
        }
    },
    template: {
        provider: Hpyer_1.HpyerTemplateProvider.NUNJUCKS,
        defaultMessageTpl: 'message.njk',
        tplExtention: '.njk',
        nunjucks: {
            autoescape: true,
            tags: {
                blockStart: '{%',
                blockEnd: '%}',
                variableStart: '{{',
                variableEnd: '}}',
                commentStart: '{#',
                commentEnd: '#}'
            }
        }
    },
});
exports.default = DefaultConfig;
