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

const getLogLevelString = (logLevel) => {
  switch (logLevel) {
    case 1: return 'debug';
    case 2: return 'info';
    case 3: return 'warn';
    case 4: return 'error';
  }
}

const setConfig = (cfg = {}) => {
  const { logLevel, timestampFormat, logFormat, output, serializers } = cfg;

  config.logLevel = 1;
  config.timestampFormat = timestampFormat || 'iso';
  config.logFormat = logFormat || '%T %L %C';
  config.output = output || { all: 'console' };
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
    if (contentObj instanceof Error) {
      return contentObj.stack;
    } else {
      return JSON.stringify(contentObj, null, '  ');
    }
  }
  return contentObj;
};




const output = (content, logLevel) => {
  const logLevelString = typeof logLevel === 'number' ? getLogLevelString(logLevel) : logLevel;
  const outputConfig = config.output[logLevelString];
  const outputFunc = (oc) => {
    if (oc === 'console') {
      console.log(content);
    }
    if(oc === 'none') {
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
    outputConfig.forEach((oc) => outputFunc(oc));
  } else {
    outputFunc(outputConfig);
  }

  if (config.output.all) {
    if (config.output.all instanceof Array) {
      config.output.all.forEach((oc) => outputFunc(oc));
    } else {
      outputFunc(config.output.all);
    }
  }

  return content;
};

const doLog = (level) => {
  return (content, serializer) => {
    if (level >= config.logLevel) {
      const timestamp = config.timestampFormat === 'iso' ? (new Date()).toISOString() : strftime(config.timestampFormat);
      const logLevel = config.logLevel;

      return output(formatLogEntry(config.logFormat, content, timestamp, level, serializer), level);
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
