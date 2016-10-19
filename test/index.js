'use strict';

const test = require('tape');

const config = {
  logLevel: 'debug',
  logFilePath: __dirname + '/log',
};

test('logger without params', (t) => {
  let sut;
  t.plan(1);
  t.throws(() => {
    sut = require('../')();
  });
});

test('logger with config', (t) => {
  t.plan(1);
  const sut = require('../')(config);
  sut.debug('test');
  t.pass();
});
