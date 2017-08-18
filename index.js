const strftime = require('strftime');
const fs = require('fs');

const config = {};

const logLevels = {
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
};

const throwErr = (err) => {
  if (err) {
    throw err;
  }
};

const setConfig = (cfg = {}) => {
  const { logLevel, timestampFormat, logFormat, output, outputConfig, serializers } = cfg;

  config.logLevel = 1;
  config.timestampFormat = timestampFormat || 'iso';
  config.logFormat = logFormat || '%T %L %C';
  config.output = output || 'console';
  config.outputConfig = outputConfig;
  config.serializers = serializers || {};
  if (logLevels[logLevel]) {
    config.logLevel = logLevels[logLevel];
  } else if (typeof logLevel === 'number' && logLevel <= logLevels.error && logLevel >= logLevels.debug) {
    config.logLevel = logLevel;
  } else if (!!logLevel) {

    throw new Error(`Invalid log level, ${logLevel + ' ' + typeof logLevel}, must be either ['debug', 'info', 'warn', 'error', 1, 2, 3, 4]`);
  }
};

const formatLogEntry = (formatStr, contentArg, timestamp, logLevel, serializer) => {

  let content;
  if (typeof serializer === 'function') {
    content = serializer(contentArg);
  }
  if (typeof serializer === 'string') {
    if (!config.serializers[serializer]) {
      throw new Error(`Missing serializer ${serializer} for content: ${JSON.stringify(contentArg)}`)
    }
    content = config.serializers[serializer](contentArg);
  }

  content = content || stringify(contentArg);
  const fields = {
    '%T': timestamp,
    '%C': content,
    '%L': logLevel,
  };
  return formatStr.replace(/%[TLC]/g, (m) => {
    return fields[m] || m;
  });
};

const stringify = (contentObj) => {
  if (contentObj instanceof Array) {
    return `[${contentObj.join(', ')}]`;
  }
  if (typeof contentObj === 'object') {
    return JSON.stringify(contentObj, null, '  ');
  }
  return contentObj;
};

const output = (content, logLevel) => {
  if (config.output === 'console') {
    console.log(content);
  }
  if(config.output === 'none') {
    return content;
  }
  if (config.output === 'file') {
    const logLevelString = typeof logLevel === 'number' ? logLevels[logLevel] : logLevel;
    if (!config.outputConfig || (!config.outputConfig.all && !config.outputConfig[logLevelString])) {
      throw new Error(`Missing outputConfig for file logging with log level ${logLevelString}`);
    }
    if (config.outputConfig.all) {
      fs.appendFile(config.outputConfig.all.file, `${content}\n`, throwErr);
    }

    if (config.outputConfig[logLevelString]) {
      fs.appendFile(config.outputConfig[logLevelString].file, content, throwErr);
    }
  }
  return content;
};

const doLog = (level) => {
  return (content, serializer) => {
    if (level >= config.logLevel) {
      const timestamp = config.timestampFormat === 'iso' ? (new Date()).toISOString() : strftime(config.timestampFormat);
      const logLevel = config.logLevel;

      return output(formatLogEntry(config.logFormat, content, timestamp, logLevel, serializer), logLevel);
    }
  }
}

setConfig();

module.exports = {
  debug: doLog(1),
  info: doLog(2),
  warn: doLog(3),
  error: doLog(4),
  setConfig,
};
