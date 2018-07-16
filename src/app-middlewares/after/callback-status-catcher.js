'use strict';
let ensureOutputEnvelope = require('../../tools/envelope').ensureOutputEnvelope;
const _ = require('lodash');
/*

*/
let callbackStatusCatcher = output => {
  const input = output.input || {};
  const callbackUsed = _.get(input, '_zapier.callback.isUsed');
  if (callbackUsed) {
    output = ensureOutputEnvelope(output);
    output.CALLBACK = true;
  }
  return output;
};

module.exports = callbackStatusCatcher;
