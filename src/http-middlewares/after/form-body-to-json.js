'use strict';

const querystring = require('querystring');

const formBodyToJson = resp => {
  const contentType = resp.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('json')) {
    resp.content = JSON.stringify(querystring.parse(resp.content));
  }
  return resp;
};

module.exports = formBodyToJson;
