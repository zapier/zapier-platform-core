'use strict';
let ensureOutputEnvelope = require('../../tools/envelope').ensureOutputEnvelope;
const _ = require('lodash');
/*

*/
let callbackStatusCatcher = output => {
  const input = output.input || {};

  console.warn(`here ${_.get(input, '_zapier.event.callbackUrl.isUsed')}`);

  const callbackUsed = _.get(input, '_zapier.event.callbackUrl.isUsed');
  if (callbackUsed) {
    output = ensureOutputEnvelope(output);
    output.status = 'CALLBACK';
  }
  return output;
};

module.exports = callbackStatusCatcher;
