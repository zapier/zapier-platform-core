'use strict';
let ensureOutputEnvelope = require('../../tools/envelope').ensureOutputEnvelope;
let STATUSES = require('../../constants').STATUSES;
const _ = require('lodash');
/*

*/
let callbackStatusCatcher = output => {
  const input = output.input || {};

  const callbackUsed = _.get(input, '_zapier.event.callbackUsed');
  if (callbackUsed) {
    output = ensureOutputEnvelope(output);
    output.status = STATUSES.CALLBACK;
  }
  return output;
};

module.exports = callbackStatusCatcher;
