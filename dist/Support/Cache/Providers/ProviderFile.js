'use strict';
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefaultCacheFileOptions = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const Logger_1 = __importDefault(require("../../Logger"));
const Utils = __importStar(require("../../Utils"));
const ContractCache_1 = __importDefault(require("../Contracts/ContractCache"));
exports.DefaultCacheFileOptions = {
    path: '',
    dirMode: 0o777,
    fileMode: 0o666,
    ext: '.cache',
};
class ProviderFile extends ContractCache_1.default {
    constructor(options) {
        super();
        this.options = null;
        this.options = Utils.extend({}, exports.DefaultCacheFileOptions, options);
        this.options.path = path_1.default.resolve(this.options.path);
        try {
            fs_1.default.accessSync(this.options.path, fs_1.default.constants.R_OK & fs_1.default.constants.W_OK);
        }
        catch (e) {
            try {
                fs_1.default.mkdirSync(this.options.path, this.options.dirMode);
            }
            catch (e) {
                Logger_1.default.error(`Fail to create folder for cache. Path: ${this.options.path}`);
            }
        }
    }
    getCacheFile(id) {
        return this.options.path + '/' + id + this.options.ext;
    }
    getCacheContent(file) {
        let dataItem = JSON.parse(fs_1.default.readFileSync(file, {
            encoding: 'utf-8',
            flag: 'r'
        }));
        if (dataItem.expireIn > 0 && dataItem.expireIn < parseInt(Utils.getFormatTime('x'))) {
            throw new Error('Cache expired.');
        }
        return dataItem.data;
    }
    get(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let content = null;
            try {
                let file = this.getCacheFile(id);
                content = this.getCacheContent(file);
            }
            catch (e) {
                content = null;
            }
            return content;
        });
    }
    has(id) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let file = this.getCacheFile(id);
                fs_1.default.accessSync(file, fs_1.default.constants.R_OK & fs_1.default.constants.W_OK);
                this.getCacheContent(file);
            }
            catch (e) {
                return false;
            }
            return true;
        });
    }
    set(id, data = null, expireIn = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            let file = this.getCacheFile(id);
            try {
                let dataItem = {
                    data,
                    expireIn: expireIn > 0 ? expireIn + parseInt(Utils.getFormatTime('x')) : 0
                };
                fs_1.default.writeFileSync(file, JSON.stringify(dataItem), {
                    mode: this.options.fileMode,
                    encoding: 'utf-8',
                    flag: 'w'
                });
            }
            catch (e) {
                return false;
            }
            return true;
        });
    }
    del(id) {
        return __awaiter(this, void 0, void 0, function* () {
            let file = this.getCacheFile(id);
            try {
                fs_1.default.unlinkSync(file);
            }
            catch (e) {
                return false;
            }
            return true;
        });
    }
}
const getCacher = function (options) {
    return new ProviderFile(options);
};
exports.default = getCacher;
