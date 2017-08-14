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
  const { logLevel, dateFormat, logFormat, output, outputConfig, serializers } = cfg;

  config.logLevel = 1;
  config.dateFormat = dateFormat || 'iso';
  config.logFormat = logFormat || '%D %L %M';
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

const formatLogEntry = (formatStr, msg, timestamp, logLevel, serializer) => {

  let messageContent;
  if (typeof serializer === 'function') {
    messageContent = serializer(msg);
  }
  if (typeof serializer === 'string') {
    if (!config.serializers[serializer]) {
      throw new Error(`Missing serializer ${serializer} for message: ${JSON.stringify(msg)}`)
    }
    messageContent = config.serializers[serializer](msg);
  }

  messageContent = messageContent || stringify(msg);
  const fields = {
    '%D': timestamp,
    '%M': messageContent,
    '%L': logLevel,
  };
  return formatStr.replace(/%[DLM]/g, (m) => {
    return fields[m] || m;
  });
};

const stringify = (msgObj) => {
  if (msgObj instanceof Array) {
    return `[${msgObj.join(', ')}]`;
  }
  if (typeof msgObj === 'object') {
    return JSON.stringify(msgObj, null, '  ');
  }
  return msgObj;
};

const output = (msg, logLevel) => {
  if (config.output === 'console') {
    console.log(msg);
  }
  if(config.output === 'none') {
    return msg;
  }
  if (config.output === 'file') {
    const logLevelString = typeof logLevel === 'number' ? logLevels[logLevel] : logLevel;
    if (!config.outputConfig || (!config.outputConfig.all && !config.outputConfig[logLevelString])) {
      throw new Error(`Missing outputConfig for file logging with log level ${logLevelString}`);
    }
    if (config.outputConfig.all) {
      fs.appendFile(config.outputConfig.all.file, `${msg}\n`, throwErr);
    }

    if (config.outputConfig[logLevelString]) {
      fs.appendFile(config.outputConfig[logLevelString].file, msg, throwErr);
    }
  }
  return msg;
};

const doLog = (level) => {
  return (msg, serializer) => {
    if (level >= config.logLevel) {
      const timestamp = config.dateFormat === 'iso' ? (new Date()).toISOString() : strftime(config.dateFormat);
      const logLevel = config.logLevel;

      return output(formatLogEntry(config.logFormat, msg, timestamp, logLevel, serializer), logLevel);
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
