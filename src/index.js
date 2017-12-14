const strftime = require('strftime');
const fs = require('fs');
const defaultSerializers = require('./serializers');

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

const getLogLevelString = (logLevel) => {
  switch (logLevel) {
    case 2: return 'info';
    case 3: return 'warn';
    case 4: return 'error';
    default: return 'debug';
  }
};

const setConfig = (cfg = {}) => {
  const { logLevel, timestampFormat, logFormat, output, serializers, logAsJson } = cfg;

  config.logLevel = 1;
  config.timestampFormat = timestampFormat || 'iso';
  config.logFormat = logFormat || '%T %L %C';
  config.output = output || { all: 'console' };
  config.serializers = Object.assign(defaultSerializers, serializers || {});
  config.logAsJson = logAsJson || false;
  if (logLevels[logLevel]) {
    config.logLevel = logLevels[logLevel];
  } else if (typeof logLevel === 'number' && logLevel <= logLevels.error && logLevel >= logLevels.debug) {
    config.logLevel = logLevel;
  } else if (logLevel) {
    throw new Error(`Invalid log level, ${`${logLevel} ${typeof logLevel}`}, must be either ['debug', 'info', 'warn', 'error', 1, 2, 3, 4]`);
  }
};

const formatLogEntry = (formatStr, message, contentArg, timestamp, logLevel, serializer) => {
  let content;
  if (typeof serializer === 'function') {
    content = serializer(contentArg, true);
  }
  if (typeof serializer === 'string') {
    if (!config.serializers[serializer]) {
      throw new Error(`Missing serializer ${serializer} for content: ${JSON.stringify(contentArg)}`);
    }
    content = config.serializers[serializer](contentArg, true);
  }

  const stringify = (contentObj) => {
    if (contentObj instanceof Array) {
      return `[${contentObj.join(', ')}]`;
    }

    if (typeof contentObj === 'object') {
      if (contentObj instanceof Error) {
        return contentObj.stack;
      }
      return JSON.stringify(contentObj, null, '  ');
    }
    return contentObj;
  };

  content = content || stringify(contentArg);
  const fields = {
    '%T': timestamp,
    '%C': content ? `${message} ${content}` : message,
    '%L': logLevel,
  };
  return formatStr.replace(/%[TLC]/g, (m) => {
    return fields[m] || m;
  });
};

const output = (content, logLevel) => {
  const logLevelString = typeof logLevel === 'number' ? getLogLevelString(logLevel) : logLevel;
  const outputConfig = config.output[logLevelString];
  const outputFunc = (oc) => {
    if (oc === 'console') {
      console.log(content);
    }
    if (oc === 'none') {
      return;
    }
    if (typeof oc === 'object') {
      if (!oc.file) {
        throw new Error(`Missing file path (file) for log level ${logLevelString}`);
      }

      fs.appendFile(oc.file, `${content}\n`, throwErr);
    }
  };

  if (outputConfig instanceof Array) {
    outputConfig.forEach((oc) => { return outputFunc(oc); });
  } else {
    outputFunc(outputConfig);
  }

  if (config.output.all) {
    if (config.output.all instanceof Array) {
      config.output.all.forEach((oc) => { return outputFunc(oc); });
    } else {
      outputFunc(config.output.all);
    }
  }

  return content;
};

const toJson = (message, data, timestamp, level, serializer) => {
  const logEntry = {
    timestamp,
    message,
    level,
  };

  if (typeof serializer === 'function') {
    Object.assign(logEntry, serializer(data));
  } else if (typeof serializer === 'string') {
    if (!config.serializers[serializer]) {
      throw new Error(`Missing serializer ${serializer} for content: ${JSON.stringify(data)}`);
    }
    Object.assign(logEntry, config.serializers[serializer](data));
  } else if (data) {
    Object.assign(logEntry, data);
  }

  return JSON.stringify(logEntry);
};

const doLog = (level) => {
  return (message, content, serializer) => {
    if (level >= config.logLevel) {
      const timestamp = config.timestampFormat === 'iso' ? (new Date()).toISOString() : strftime(config.timestampFormat);
      if (config.logAsJson) {
        return output(toJson(message, content, timestamp, level, serializer), level);
      }

      return output(formatLogEntry(config.logFormat, message, content, timestamp, level, serializer), level);
    }

    return null;
  };
};

setConfig();

module.exports = {
  debug: doLog(1),
  info: doLog(2),
  warn: doLog(3),
  error: doLog(4),
  setConfig,
};
