const express = ({ req, res, ...obj }, doStringify = false) => {
  const result = {};
  if (req) {
    Object.assign(result, {
      method: req.method,
      url: req.originalUrl || req.url,
      query: req.query || '',
    });

    if (typeof req.get === 'function') {
      Object.assign(result, {
        correlationId: req.get('x-correlation-id'),
      });
    }

    if (req.connection) {
      Object.assign(result, {
        remoteAddress: req.connection.remoteAddress,
        remotePort: req.connection.remotePort,
      });
    }
  }

  if (res) {
    Object.assign(result, {
      statusCode: res.statusCode,
    });

    if (res.locals) {
      Object.assign(result, {
        claims: typeof res.locals.claims === 'undefined' ? '' : res.locals.claims,
        tokenValid: typeof res.locals.tokenValid === 'undefined' ? '' : res.locals.tokenValid,
      });
    }
  }

  Object.assign(result, obj);
  if (doStringify) {
    return JSON.stringify(result, null, '  ');
  }

  return result;
};

module.exports = {
  express,
};
