const express = ({ req, res }) => {
  return {
    express: {
      req: {
        method: req.method,
        url: req.originalUrl || req.url,
      },
      res: {
        statusCode: res.statusCode,
      },
    },
  };
};

module.exports = {
  express,
};
