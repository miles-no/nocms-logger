# Logger package for NoCMS

NoCMS logger uses bunyan as base logger. More information about bunyan here: [https://github.com/trentm/node-bunyan](https://github.com/trentm/node-bunyan)

[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

## Usage
```
const logger = require('nocms-logger');
logger.warn(<message or object goes here>);
```

## Log Levels
The following log levels are available:

* debug
* info
* warn
* error

You can specify which log-level the logger should log (and all levels above), by passing in `logLevel`.
Example:

```
const logger = require('nocms-logger')({ logLevel: 'info' });
logger.warn(<message or object goes here>);
```

The above example will log `info`, `warn` and `error` messages, but not `debug`.

## Output
By default (version > 2.0.0) all output will be directed to console.
If `useFileStreams` is set to `true`, all output will be logged to files.
You can specify which directory using `logFilePath` (default is `/log`).

Example using file streams:
```
const logger = require('nocms-logger')({
  logLevel: 'info',
  useFileStreams: true,
  logFilePath: '/var/log/nocms'
});
logger.warn(<message or object goes here>);
```

## Commit message format and publishing

This repository is published using `semantic-release`, with the default [AngularJS Commit Message Conventions](https://docs.google.com/document/d/1QrDFcIiPjSLDn3EL15IJygNPiHORgU1_OOAqWjiDU5Y/edit).