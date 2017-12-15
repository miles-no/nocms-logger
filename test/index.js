const test = require('tape');

let sut;

test('default config', (t) => {
  t.plan(1);

  sut = require('../src/'); // eslint-disable-line global-require
  const result = sut.debug('foo');

  t.ok(/^\{"timestamp":".+","message":"foo","level":1}$/.test(result));
});

test('log level debug', (t) => {
  t.plan(4);

  const config = {
    logLevel: 'debug',
  };

  sut = require('../src/'); // eslint-disable-line global-require
  sut.setConfig(config);

  t.ok(sut.debug('foo'));
  t.ok(sut.info('foo'));
  t.ok(sut.warn('foo'));
  t.ok(sut.error('foo'));
});

test('numeric log level', (t) => {
  t.plan(4);
  const config = {
    logLevel: 3,
  };

  sut = require('../src/'); // eslint-disable-line global-require
  sut.setConfig(config);

  t.notOk(sut.debug('foo'));
  t.notOk(sut.info('foo'));
  t.ok(sut.warn('foo'));
  t.ok(sut.error('foo'));
});

test('should throw for invalid log level', (t) => {
  t.plan(1);

  sut = require('../src/'); // eslint-disable-line global-require

  t.throws(() => {
    sut.setConfig({ logLevel: 'foo' });
  });
});

test('should throw for file logging with missing file config', (t) => {
  t.plan(1);
  const config = {
    output: {
      info: {},
    },
  };

  sut = require('../src/'); // eslint-disable-line global-require
  sut.setConfig(config);

  t.throws(() => {
    sut.info('foo');
  });
});

test.skip('should support multiple outputs for each log level', (t) => {
  t.plan(1);
  const config = {
    output: {
      info: ['console', { file: 'logs/info.log' }],
    },
  };

  sut = require('../src/'); // eslint-disable-line global-require
  sut.setConfig(config);

  sut.info('foo');
  t.pass();
});

test.skip('should log to file', (t) => {
  t.plan(1);
  const config = {
    output: {
      all: { file: 'logs/all.log' },
    },
  };

  sut = require('../src/'); // eslint-disable-line global-require
  sut.setConfig(config);
  sut.info('foo');

  t.pass();
});

test('log level warn', (t) => {
  t.plan(4);

  const config = {
    logLevel: 'warn',
  };

  sut = require('../src/'); // eslint-disable-line global-require

  sut.setConfig(config);
  t.notOk(sut.debug('foo'));
  t.notOk(sut.info('foo'));
  t.ok(sut.warn('foo'));
  t.ok(sut.error('foo'));
});

test('log level error', (t) => {
  t.plan(4);

  const config = {
    logLevel: 'error',
  };

  sut = require('../src/'); // eslint-disable-line global-require

  sut.setConfig(config);
  t.notOk(sut.debug('foo'));
  t.notOk(sut.info('foo'));
  t.notOk(sut.warn('foo'));
  t.ok(sut.error('foo'));
});

test('custom date format', (t) => {
  t.plan(1);

  const config = {
    logAsJson: false,
    timestampFormat: '%d.%m.%Y-%H:%M',
  };

  sut = require('../src/'); // eslint-disable-line global-require

  sut.setConfig(config);
  const result = sut.debug('foo');
  t.ok(/^\d{2}\.\d{2}\.\d{4}-\d{2}:\d{2}/.test(result));
});

test('custom format', (t) => {
  t.plan(1);
  const config = {
    logAsJson: false,
    logFormat: '%L %C',
  };

  sut = require('../src/'); // eslint-disable-line global-require
  sut.setConfig(config);

  const result = sut.debug('foo');
  t.equals(result, '1 foo');
});

test('log object', (t) => {
  t.plan(1);

  const config = {
    logAsJson: false,
    logFormat: '%L %C',
  };

  sut = require('../src/'); // eslint-disable-line global-require
  sut.setConfig(config);

  const result = sut.debug('foo', { foo: 1, bar: 2 });
  t.equal(result, '1 foo {\n  "foo": 1,\n  "bar": 2\n}');
});

test('custom serializer function', (t) => {
  t.plan(1);

  const config = {
    logAsJson: false,
    logFormat: '%L %C',
  };
  sut = require('../src/'); // eslint-disable-line global-require
  sut.setConfig(config);
  const result = sut.debug('foo', { foo: 1, bar: 2 }, (fooobject) => {
    return `Foo=${fooobject.foo} and bar=${fooobject.bar}`;
  });
  t.equal(result, '1 foo Foo=1 and bar=2');
});

test('custom serializer reference', (t) => {
  t.plan(1);

  const config = {
    logAsJson: false,
    logFormat: '%L %C',
    serializers: {
      fooSerializer: (fooobject) => {
        return `Foo=${fooobject.foo} and bar=${fooobject.bar}`;
      },
    },
  };
  sut = require('../src/'); // eslint-disable-line global-require
  sut.setConfig(config);
  const result = sut.debug('foo', { foo: 1, bar: 2 }, (fooobject) => {
    return `Foo=${fooobject.foo} and bar=${fooobject.bar}`;
  });
  t.equal(result, '1 foo Foo=1 and bar=2');
});


test('invalid custom serializer', (t) => {
  t.plan(1);

  sut = require('../src/'); // eslint-disable-line global-require
  t.throws(() => {
    sut.debug('foo', { foo: 1, bar: 2 }, 'invalidSerializer');
  });
});

test('should serialize Error objects with stack trace', (t) => {
  t.plan(1);

  sut = require('../src/'); // eslint-disable-line global-require
  const result = sut.debug('foo', new Error('foo'));
  t.ok(/^1 foo Error: foo[\s]+at Test.test/.test(result));
});

test('log as json', (t) => {
  t.plan(1);

  const config = {
    logAsJson: true,
  };

  sut = require('../src/'); // eslint-disable-line global-require
  sut.setConfig(config);
  const result = sut.debug('foo');
  t.ok(/^\{"timestamp":".+","message":"foo","level":1}$/.test(result));
});

test('log as json with object', (t) => {
  t.plan(1);

  const config = {
    logAsJson: true,
  };

  sut = require('../src/'); // eslint-disable-line global-require
  sut.setConfig(config);
  const result = sut.debug('foo', { bar: 1 });
  t.ok(/^\{"timestamp":".+","message":"foo","level":1,"bar":1}$/.test(result));
});

test('log as json with custom serializer', (t) => {
  t.plan(1);

  const config = {
    logAsJson: true,
  };

  sut = require('../src/'); // eslint-disable-line global-require
  sut.setConfig(config);
  const result = sut.debug('foo', { bar: 1 }, (obj) => {
    return { foo: obj.bar };
  });
  t.ok(/^\{"timestamp":".+","message":"foo","level":1,"foo":1}$/.test(result));
});

test('log as json with default serializer for express', (t) => {
  t.plan(1);

  const config = {
    logAsJson: true,
  };

  const req = { method: 'GET', originalUrl: 'test' };
  const res = { statusCode: 200 };

  sut = require('../src/'); // eslint-disable-line global-require
  sut.setConfig(config);
  const result = sut.debug('foo', { req, res }, 'express');
  t.ok(/^\{"timestamp":".+","message":"foo","level":1,"method":"GET","url":"test","query":"","statusCode":200}$/.test(result));
});

test('express serializer returns other data', (t) => {
  t.plan(1);

  const config = {
    logAsJson: true,
  };

  const req = { method: 'GET', originalUrl: 'test' };
  const res = { statusCode: 200 };
  const otherData = { bar: 2 };

  sut = require('../src/'); // eslint-disable-line global-require
  sut.setConfig(config);
  const result = sut.debug('foo', { req, res, otherData }, 'express');
  t.ok(/^\{"timestamp":".+","message":"foo","level":1,"method":"GET","url":"test","query":"","statusCode":200,"otherData":{"bar":2}}$/.test(result));
});

test('express serializer returns stringified data when logAsJson is false', (t) => {
  t.plan(1);

  const config = {
    logAsJson: false,
    logFormat: '%L %C',
  };

  const req = { method: 'GET', originalUrl: 'test' };
  const res = { statusCode: 200 };
  const otherData = { bar: 2 };

  sut = require('../src/'); // eslint-disable-line global-require
  sut.setConfig(config);
  const result = sut.debug('foo', { req, res, otherData }, 'express');
  t.equal(result, '1 foo {\n  "method": "GET",\n  "url": "test",\n  "query": "",\n  "statusCode": 200,\n  "otherData": {\n    "bar": 2\n  }\n}');
});

test('colors', (t) => {
  t.plan(4);

  const config = {
    logAsJson: false,
    useChalk: true,
  };

  sut = require('../src/'); // eslint-disable-line global-require
  sut.setConfig(config);

  t.ok(sut.debug('foo', { foo: 1, bar: 1 }));
  t.ok(sut.info('foo', { foo: 1, bar: 1 }));
  t.ok(sut.warn('foo', { foo: 1, bar: 1 }));
  t.ok(sut.error('foo', { foo: 1, bar: 1 }));
});
