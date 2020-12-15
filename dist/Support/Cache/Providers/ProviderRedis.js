'use strict';
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
const ioredis_1 = __importDefault(require("ioredis"));
const loglevel_1 = __importDefault(require("loglevel"));
const ContractCache_1 = __importDefault(require("../Contracts/ContractCache"));
let client = null;
class ProviderRedis extends ContractCache_1.default {
    constructor(options) {
        super();
        try {
            if (!client) {
                client = new ioredis_1.default(options);
            }
        }
        catch (e) {
            loglevel_1.default.error(`Fail to create Redis client.`, e);
        }
    }
    get(id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!client)
                return null;
            let content = null;
            try {
                content = JSON.parse(yield client.get(id));
            }
            catch (e) {
                loglevel_1.default.info(`Fail to get content via key '${id}'`, e);
                return null;
            }
            return content;
        });
    }
    has(id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!client)
                return false;
            let res = 0;
            try {
                res = yield client.exists(id);
            }
            catch (e) {
                return false;
            }
            return res == 1;
        });
    }
    set(id, data = null, expireIn = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!client)
                return false;
            try {
                if (expireIn > 0) {
                    yield client.set(id, JSON.stringify(data), 'EX', expireIn);
                }
                else {
                    yield client.set(id, JSON.stringify(data));
                }
            }
            catch (e) {
                loglevel_1.default.info(`Fail to set content via key '${id}' with: `, data, e);
                return false;
            }
            return true;
        });
    }
    del(id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!client)
                return false;
            try {
                yield client.del(id);
            }
            catch (e) {
                return false;
            }
            return true;
        });
    }
}
const getCacher = function (options) {
    return new ProviderRedis(options);
};
exports.default = getCacher;
