'use strict';

const https = require('https');

const disableSSLCertCheck = req => {
  req.agent = new https.Agent({ rejectUnauthorized: false });
  return req;
};

module.exports = disableSSLCertCheck;
