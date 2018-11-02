const _ = require('lodash');

const FORM_TYPE = 'application/x-www-form-urlencoded';
const JSON_TYPE = 'application/json';
const JSON_TYPE_UTF8 = 'application/json; charset=utf-8';

const getContentType = headers => {
  const headerKeys = Object.keys(headers);
  let foundKey = '';

  _.each(headerKeys, key => {
    if (key.toLowerCase() === 'content-type') {
      foundKey = key;
      return false;
    }

    return true;
  });

  return _.get(headers, foundKey, '');
};

module.exports = {
  FORM_TYPE,
  JSON_TYPE,
  JSON_TYPE_UTF8,
  getContentType
};
