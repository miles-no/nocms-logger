# Logger package for NoCMS

NoCMS logger uses bunyan as base logger. More information about bunyan here: [https://github.com/trentm/node-bunyan](https://github.com/trentm/node-bunyan)

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
