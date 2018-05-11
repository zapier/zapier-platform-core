'use strict';

const _ = require('lodash');

const createLegacyScriptingRunner = (z, app) => {
  const source = app.legacyScriptingSource;
  if (!source) {
    return null;
  }

  let legacyScriptingRunnerFactory = null;
  try {
    legacyScriptingRunnerFactory = require('zapier-platform-legacy-scripting-runner');
  } catch (e) {
    // Do nothing
  }

  if (!legacyScriptingRunnerFactory) {
    return null;
  }

  const { DOMParser, XMLSerializer } = require('xmldom');
  const {
    ErrorException,
    HaltedException,
    StopRequestException,
    ExpiredAuthException,
    RefreshTokenException,
    InvalidSessionException
  } = require('zapier-platform-legacy-scripting-runner/exceptions');

  const Zap = new Function( // eslint-disable-line no-new-func
    '_',
    'crypto',
    'async',
    'moment',
    'DOMParser',
    'XMLSerializer',
    'atob',
    'btoa',
    'z',
    '$',
    'ErrorException',
    'HaltedException',
    'StopRequestException',
    'ExpiredAuthException',
    'RefreshTokenException',
    'InvalidSessionException',
    source + '\nreturn Zap;'
  )(
    _,
    require('crypto'),
    require('async'),
    require('moment-timezone'),
    DOMParser,
    XMLSerializer,
    require('zapier-platform-legacy-scripting-runner/atob'),
    require('zapier-platform-legacy-scripting-runner/btoa'),
    require('zapier-platform-legacy-scripting-runner/z'),
    require('zapier-platform-legacy-scripting-runner/$'),
    ErrorException,
    HaltedException,
    StopRequestException,
    ExpiredAuthException,
    RefreshTokenException,
    InvalidSessionException
  );

  // const authType = _.get(app, 'authenticatin.type', 'custom');
  const runner = legacyScriptingRunnerFactory(Zap);

  const smartRunEvent = (bundle, typeOf, key) => {
    if (typeOf === 'trigger') {
      let promise = null;
      let funcs = [];

      const fullMethod = Zap[`${key}_poll`];
      if (fullMethod) {
        promise = runner.runEvent({ key, name: 'trigger.poll' }, z, bundle);
      } else {
        const preMethod = Zap[`${key}_pre_poll`];
        if (preMethod) {
          promise = runner.runEvent({ key, name: 'trigger.pre' }, z, bundle);
        } else {
          promise = Promise.resolve({
            method: app.triggers[key].operation.perform.method,
            url: app.triggers[key].operation.perform.url
          });
        }

        funcs.push(request => z.request(request));

        const postMethod = Zap[`${key}_post_poll`];
        if (postMethod) {
          funcs.push(response => {
            response.throwForStatus();
            return runner.runEvent({ key, name: 'trigger.post' }, z, bundle);
          });
        } else {
          funcs.push(response => {
            response.throwForStatus();
            return z.JSON.parse(response.content);
          });
        }
      }

      return funcs.reduce((prev, cur) => prev.then(cur), promise);
    }

    // TODO: auth, create, and search
    return Promise.resolve();
  };

  return { run: smartRunEvent };
};

module.exports = createLegacyScriptingRunner;
