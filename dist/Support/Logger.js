"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const loglevel_1 = __importDefault(require("loglevel"));
const loglevel_plugin_prefix_1 = __importDefault(require("loglevel-plugin-prefix"));
loglevel_plugin_prefix_1.default.reg(loglevel_1.default);
/**
 * 颜色映射表，更多颜色：https://misc.flogisoft.com/bash/tip_colors_and_formatting
 */
const COLOR = {
    Default: '\x1B[39m',
    LightGray: '\x1B[245m',
    DarkGray: '\x1B[90m',
    Green: '\x1B[32m',
    // for loglevel
    TRACE: '\x1B[35m',
    DEBUG: '\x1B[96m',
    INFO: '\x1B[97m',
    WARN: '\x1B[33m',
    ERROR: '\x1B[31m', // Magenta
};
const DefaultName = 'HpyerServer';
loglevel_plugin_prefix_1.default.apply(loglevel_1.default, {
    nameFormatter: function (name) {
        return name || DefaultName;
    },
    format(level, name, timestamp) {
        level = level.toUpperCase();
        return `${COLOR.DarkGray}[${timestamp}]${COLOR.Default} ${COLOR[level]}${level}${COLOR.Default} ${COLOR.Green}${name}${COLOR.Default}:`;
    },
});
exports.default = loglevel_1.default;
