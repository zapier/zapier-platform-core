'use strict';

const _ = require('lodash');

// Does string replacement ala WB, using bundle and a potential result object
const replaceVars = (templateString, bundle, result) => {
  const options = {
    interpolate: /{{([\s\S]+?)}}/g
  };
  const values = _.extend({}, bundle.authData, bundle.inputData, result);
  return _.template(templateString, options)(values);
};

const createLegacyScriptingRunner = (z, app) => {
  const source = app.legacyScriptingSource;
  if (!source) {
    return null;
  }

  // Only UI-built app will have this legacy-scripting-runner dependency, so we
  // need to make it an optional dependency
  let legacyScriptingRunnerFactory = null;
  try {
    legacyScriptingRunnerFactory = require('zapier-platform-legacy-scripting-runner');
  } catch (e) {
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

  // Simulates how backend run legacy scripting. This exposes a
  // z.legacyScripting.run() method that we can run legacy scripting easily
  // like z.legacyScripting.run(bundle, 'trigger', 'KEY') in CLI.
  const runScripting = (bundle, typeOf, key) => {
    if (typeOf === 'trigger') {
      let promise = null;
      let funcs = [];

      bundle._legacyUrl = _.get(
        app,
        `triggers.${key}.operation.legacyProps.url`
      );
      bundle._legacyUrl = replaceVars(bundle._legacyUrl, bundle);

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

  return { run: runScripting };
};

module.exports = createLegacyScriptingRunner;
