# Logger package for NoCMS

[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
[![Dependency Status](https://david-dm.org/miles-no/nocms-logger.svg)](https://david-dm.org/miles-no/nocms-logger)
[![devDependencies](https://david-dm.org/miles-no/nocms-logger/dev-status.svg)](https://david-dm.org/miles-no/nocms-logger?type=dev)

## Install
```
npm install nocms-logger
```

## Usage
```
const logger = require('nocms-logger');
logger.warn(<message or object goes here>);
```

## Config

Use `logger.setConfig(configObj)` to override the defaults.

|   field         | description                                                              | default     |
|-----------------|--------------------------------------------------------------------------|-------------|
|   logLevel      | One of `debug`, `info`, `warn` or `error`, or numeric, 1-4. Select the minimun log level to to output | `debug`     |
| timestampFormat | [strftime](https://github.com/samsonjs/strftime) formatted date string. Example `'%d.%m.%Y %H:%M'` | ISO 8601 |
| logFormat       | String template for log format. `%T` for timestamp, `%C` for message content and `%L` for numeric log level | `'%T %L %C'` |
| output          | One of `console`, `none` or `file`. The logger functions return the output string, so that ouput `none` makes sense if you wish to manually do the logging using the returned value. Output `file` uses an additional `outputConfig` object.  | `console` |
| outputConfig    | One output config can be assigned for each log level, in addition to `all` which will cover all of them. Each config is an object with a property `file` pointing to a file, of which the log entry is appended to. | &nbsp; |
| serializers     | An object containing a set of functions to serialize certain types of log entries. The logger functions takes a second parameter, `serializer`, which will match a serializer provided in the config.

### Output Config Example

This example shows the configuration where all log entries are logged to file (`file.log`), whereas debug entries are also logged to console, info entries to `info.log` and errors to `error.log`. Each log level can also have an array lising multiple log outputs, such as `error` in the following example.

```
config.output = {
  all: { file: '/path/to/file.log' },
  debug: 'console',
  info: { file: '/path/to/info.log' },
  error: ['console', { file: '/path/to/error.log' }],
};
```

### Serializer Example

This example shows how certain objects can be serialized to custom formatted strings. Keep in mind that it is only the entry's content (`%C`) that is serialized, so that you can use the logFormat configuration as well.

```
config.serializers = {
  superagentError: (err) => {
    return `${err.status} ${err.response.text}`;
  }
};
```

Further specifying log format `logFormat: '%C (%L)'` will result in the following output: `404 Not found (4)`.
