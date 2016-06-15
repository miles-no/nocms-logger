'use strict';

const test = require('tape');

const config = {
  logLevel: 'debug'
};

const sut = require('../')(config);

test('logger', (t) => {
  sut.debug('test');
  t.pass();
  t.end();
});
