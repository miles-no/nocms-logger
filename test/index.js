'use strict';

const test = require('tape');

const config = {
  logLevel: 'debug'
};

test('logger without params', (t) => {
  let sut;
  t.throws(() => {
    sut = require('../');
  });
});

test('logger', (t) => {
  const sut = require('../')(config);
  sut.debug('test');
  t.pass();
});

test('logger', (t) => {
  t.doesNotThrow(() => {
    const sut = require('../');
    sut.debug('test');
  });
});
