'use strict';

const crypto = require('crypto');

const wrapHydrate = payload => {
  payload = JSON.stringify(payload);

  if (process.env._ZAPIER_ONE_TIME_SECRET) {
    payload = new Buffer(payload).toString('base64');

    const signature = Buffer.from(
      crypto
        .createHmac('sha1', process.env._ZAPIER_ONE_TIME_SECRET)
        .update(payload)
        .digest()
    ).toString('base64');

    payload += ':' + signature;
  }

  return 'hydrate|||' + payload + '|||hydrate';
};

module.exports = wrapHydrate;
