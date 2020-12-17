import LogLevel from 'loglevel';
import LogLevelPrefix from 'loglevel-plugin-prefix';

LogLevelPrefix.reg(LogLevel);

/**
 * 颜色映射表，更多颜色：https://misc.flogisoft.com/bash/tip_colors_and_formatting
 */
const COLOR = {
  DefaultFG : '\x1B[39m',  // Default Foreground
  DefaultBG : '\x1B[49m',  // Default Background
  LightGray : '\x1B[245m', // Light gray
  DarkGray  : '\x1B[90m',  // Dark gray
  Green     : '\x1B[32m',  // Green
  GreenBG   : '\x1B[42m',  // Green Background

  // for loglevel
  TRACE     : '\x1B[35m',  // Magenta
  DEBUG     : '\x1B[96m',  // Cyan
  INFO      : '\x1B[97m',  // White
  WARN      : '\x1B[33m',  // Yellow
  ERROR     : '\x1B[31m',  // Magenta
};

const DefaultName = 'HpyerServer';

LogLevelPrefix.apply(LogLevel, {
  nameFormatter: function (name) {
    return name || DefaultName;
  },
  format(level, name, timestamp) {
    level = level.toUpperCase();
    return `${COLOR.DarkGray}[${timestamp}]${COLOR.DefaultFG} ${COLOR[level]}${level}${COLOR.DefaultFG} ${name === DefaultName ? COLOR.Green : COLOR.GreenBG + ' '}${name}${name === DefaultName ? COLOR.DefaultFG : ' ' + COLOR.DefaultBG}:`;
  },
});

export default LogLevel;
