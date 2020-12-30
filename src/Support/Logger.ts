import LogLevel from 'loglevel';
import LogLevelPrefix from 'loglevel-plugin-prefix';

LogLevelPrefix.reg(LogLevel);

/**
 * 颜色映射表，更多颜色：https://misc.flogisoft.com/bash/tip_colors_and_formatting
 */
const COLOR = {
  Default : '\x1B[39m',  // Default Foreground
  LightGray : '\x1B[245m', // Light gray
  DarkGray  : '\x1B[90m',  // Dark gray
  Green     : '\x1B[32m',  // Green

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
    return `${COLOR.DarkGray}[${timestamp}]${COLOR.Default} ${COLOR[level]}${level}${COLOR.Default} ${COLOR.Green}${name}${COLOR.Default}:`;
  },
});

export default LogLevel;
