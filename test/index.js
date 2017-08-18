const test = require('tape');
let sut;

test('default config', (t) => {

  t.plan(1);

  sut = require('../');
  const result = sut.debug('foo');
  t.ok(/.*foo$/.test(result));
});

test('log level debug', (t) => {

  t.plan(4);

  const config = {
    logLevel: 'debug',
  };

  sut = require('../');
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

  sut = require('../');
  sut.setConfig(config);

  t.notOk(sut.debug('foo'));
  t.notOk(sut.info('foo'));
  t.ok(sut.warn('foo'));
  t.ok(sut.error('foo'));
});

test('should throw for invalid log level', (t) => {
  t.plan(1);

  sut = require('../');

  t.throws(() => {
    sut.setConfig({ logLevel: 'foo' });
  });
});

test('should throw for file logging with missing file config', (t) => {
  t.plan(1);
  const config = {
    output: 'file',
  };

  sut = require('../');
  sut.setConfig(config);

  t.throws(() => {
    sut.info('foo');
  });
});

test.skip('should log to file', (t) => {
  t.plan(1);
  const config = {
    output: 'file',
    outputConfig: {
      all: { file: 'logs/all.txt' },
    },
  };

  sut = require('../');
  sut.setConfig(config);
  sut.info('foo');

  t.pass();
});

test('log level error', (t) => {
  t.plan(4);

  const config = {
    logLevel: 'error',
  };

  sut = require('../');

  sut.setConfig(config);
  t.notOk(sut.debug('foo'));
  t.notOk(sut.info('foo'));
  t.notOk(sut.warn('foo'));
  t.ok(sut.error('foo'));

});

test('custom date format', (t) => {
  t.plan(1);

  const config = {
    timestampFormat: '%d.%m.%Y-%H:%M',
  };

  sut = require('../');

  sut.setConfig(config);
  const result = sut.debug('foo');
  t.ok(/^\d{2}\.\d{2}\.\d{4}-\d{2}:\d{2}/.test(result))
});

test('custom format', (t) => {
  t.plan(1);
  const config = {
    logFormat: '%L %C',
  };

  sut = require('../');
  sut.setConfig(config);

  const result = sut.debug('foo');
  t.equals(result, '1 foo');
});

test('log object', (t) => {
  t.plan(1);
  sut = require('../');

  const result = sut.debug({ foo: 1, bar: 2 });
  t.equal(result, '1 {\n  "foo": 1,\n  "bar": 2\n}')
});

test('custom serializer function', (t) => {
  t.plan(1);

  const config = {
    logFormat: '%L %C',
  };
  sut = require('../');
  sut.setConfig(config);
  const result = sut.debug({ foo: 1, bar: 2 }, (fooobject) => {
    return `Foo=${fooobject.foo} and bar=${fooobject.bar}`;
  });
  t.equal(result, '1 Foo=1 and bar=2');
});

test('custom serializer reference', (t) => {
  t.plan(1);

  const config = {
    logFormat: '%L %C',
    serializers: {
      'fooSerializer': (fooobject) => {
        return `Foo=${fooobject.foo} and bar=${fooobject.bar}`;
      },
    },
  };
  sut = require('../');
  sut.setConfig(config);
  const result = sut.debug({ foo: 1, bar: 2 }, (fooobject) => {
    return `Foo=${fooobject.foo} and bar=${fooobject.bar}`;
  });
  t.equal(result, '1 Foo=1 and bar=2');
});


test('invalid custom serializer', (t) => {
  t.plan(1);

  sut = require('../');
  t.throws(() => {
    const result = sut.debug({ foo: 1, bar: 2 }, 'invalidSerializer');
  });
});
