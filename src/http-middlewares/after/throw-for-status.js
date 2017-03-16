'use strict';

const errors = require('../../errors');

const throwForStatus = (resp) => {
  if (resp.status > 300) {
    const message = `Got ${resp.status} calling ${resp.request.method} ${resp.request.url}, expected 2xx.`;

    if (resp.status === 401) {
      throw new errors.RefreshAuthError(message);
    }
    throw new Error(message);
  }

  return resp;
};

module.exports = throwForStatus;
