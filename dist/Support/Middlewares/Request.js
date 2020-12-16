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
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
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
const Utils = __importStar(require("../Utils"));
const loglevel_1 = __importDefault(require("loglevel"));
const request_ip_1 = __importDefault(require("request-ip"));
const XssHandler = function (item) {
    if (Utils.isObject(item)) {
        let newItem = {};
        for (let k in item) {
            k = Utils.xssFilter(k);
            if (!k)
                continue;
            newItem[k] = XssHandler(item[k]);
        }
        return newItem;
    }
    else if (Utils.isArray(item)) {
        let newItem = [];
        for (let i = 0; i < item.length; i++) {
            newItem[i] = XssHandler(item[i]);
        }
        return newItem;
    }
    else {
        return Utils.xssFilter(item);
    }
};
function default_1(ctx, next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (ctx.path == '/favicon.ico') {
            return false;
        }
        ctx.request.client_ip = request_ip_1.default.getClientIp(ctx.request);
        loglevel_1.default.info('[' + ctx.request.client_ip + ']', ctx.request.url);
        ctx.request.query_raw = {};
        if (ctx.request.query) {
            for (let k in ctx.request.query) {
                ctx.request.query_raw[k] = ctx.request.query[k];
                ctx.request.query[k] = XssHandler(ctx.request.query[k]);
            }
        }
        else {
            ctx.request.query = {};
        }
        ctx.request.post = {};
        ctx.request.post_raw = {};
        if (ctx.request['body'].params) {
            for (let k in ctx.request['body'].params) {
                ctx.request.post_raw[k] = ctx.request['body'].params[k];
                ctx.request.post[k] = XssHandler(ctx.request['body'].params[k]);
            }
        }
        else if (ctx.request['body'].fields) {
            for (let k in ctx.request['body'].fields) {
                if (k == 'files')
                    continue;
                ctx.request.post_raw[k] = ctx.request['body'].fields[k];
                ctx.request.post[k] = XssHandler(ctx.request['body'].fields[k]);
            }
        }
        else if (ctx.request['body']) {
            for (let k in ctx.request['body']) {
                if (k == 'files')
                    continue;
                ctx.request.post_raw[k] = ctx.request['body'][k];
                ctx.request.post[k] = XssHandler(ctx.request['body'][k]);
            }
        }
        yield next();
    });
}
exports.default = default_1;
;
