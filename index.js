'use strict';

const bunyan = require('bunyan');
const logLevels = ['debug', 'info', 'warn', 'error'];

const getConfig = (cfg) => {
  const path = cfg.logFilePath || '/log';

  const logConfig = {
    name: cfg.name || 'nocms_logger',
    streams: [],
    serializers: cfg.serializers
  };

  logConfig.streams.push({
    level: 'error',
    path: `${path}/error.log`,
  });

  if(logLevels.indexOf(cfg.logLevel) < 1){
    logConfig.streams.push({
      level: 'debug',
      stream: process.stdout,
    });
    logConfig.streams.push({
      level: 'debug',
      path: `${path}/debug.log`,
    });
  }

  if(logLevels.indexOf(cfg.logLevel) < 2){
    logConfig.streams.push({
      level: 'info',
      path: `${path}/info.log`,
    });
  }

  if(logLevels.indexOf(cfg.logLevel) < 3){
    logConfig.streams.push({
      level: 'warn',
      path: `${path}/warn.log`,
    });
  }

  if(logLevels.indexOf(cfg.logLevel) < 4){
    logConfig.streams.push({
      level: 'error',
      path: `${path}/error.log`,
    });
  }

  return logConfig;
};


const doLog = (logger, level, entry, fields) => {
  if(!logger[level]){
    logger.debug('Attempted to log with an invalid log level: "' + level + '"');
    return;
  }

  if(fields){
    logger[level](fields, entry);
    return;
  }
  logger[level](entry);
};

const getLoggerFunc = (lvl, log) => {
  const level = lvl;
  const logger = log;
  return (entry, fields) => {
    doLog(logger, level, entry, fields);
  }
};

module.exports = (cfg, serializers) => {
  const logConfig = getConfig(cfg);

  const log = bunyan.createLogger(logConfig);

  log.on('error', function(err, stream){
    console.log((new Date()).toISOString(), 'LOGGER ERROR', err);
  });

  return logLevels.reduce((loggers, logLevel) => {
    loggers[logLevel] = getLoggerFunc(logLevel, log);
    return loggers;
  }, {});
};
