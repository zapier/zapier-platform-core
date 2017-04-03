'use strict';

const _ = require('lodash');
const cleaner = require('./cleaner');
const dataTools = require('./data');
const zapierSchema = require('zapier-platform-schema');
const styleGuideChecker = require('./style-guide-checker');

// Take a resource with methods like list/hook and turn it into triggers, etc.
const convertResourceDos = (appRaw) => {
  let triggers = {}, searches = {}, creates = {}, searchOrCreates = {};

  _.each(appRaw.resources, (resource) => {
    let search, create;

    if (resource.hook && resource.hook.operation) {
      let trigger = dataTools.deepCopy(resource.hook);
      trigger.key = `${resource.key}Hook`;
      trigger.noun = resource.noun;
      trigger.operation.resource = resource.key;
      trigger.operation.type = 'hook';
      triggers[trigger.key] = trigger;
    }

    if (resource.list && resource.list.operation) {
      let trigger = dataTools.deepCopy(resource.list);
      trigger.key = `${resource.key}List`;
      trigger.noun = resource.noun;
      trigger.operation.resource = resource.key;
      trigger.operation.type = 'polling';
      triggers[trigger.key] = trigger;
    }

    if (resource.search && resource.search.operation) {
      search = dataTools.deepCopy(resource.search);
      search.key = `${resource.key}Search`;
      search.noun = resource.noun;
      search.operation.resource = resource.key;
      searches[search.key] = search;
    }

    if (resource.create && resource.create.operation) {
      create = dataTools.deepCopy(resource.create);
      create.key = `${resource.key}Create`;
      create.noun = resource.noun;
      create.operation.resource = resource.key;
      creates[create.key] = create;
    }

    if (search && create) {
      let searchOrCreate = {
        key: `${resource.key}SearchOrCreate`,
        display: {
          label: `Find or Create ${resource.noun}`,
          description: '' // Leave blank to get the default from Zapier UI
        },
        search: search.key,
        create: create.key
      };
      searchOrCreates[searchOrCreate.key] = searchOrCreate;
    }

  });

  return { triggers, searches, creates, searchOrCreates };
};

/* When a trigger/search/create (action) links to a resource, we walk up to
 * the resource and copy missing properties from resource to the action.
 */
const copyPropertiesFromResource = (type, action, appRaw) => {
  if (appRaw.resources && action.operation && appRaw.resources[action.operation.resource]) {
    const copyableProperties = ['outputFields', 'sample'];
    const resource = appRaw.resources[action.operation.resource];

    if (type === 'trigger' && action.operation.type === 'hook') {
      if (_.get(resource, 'list.operation.perform')) {
        action.operation.performList = action.operation.performList || resource.list.operation.perform;
      }
    } else if (type === 'search' || type === 'create') {
      if (_.get(resource, 'get.operation.perform')) {
        action.operation.performGet = action.operation.performGet || resource.get.operation.perform;
      }
    }

    _.extend(action.operation, _.pick(resource, copyableProperties));
  }

  return action;
};

const compileApp = (appRaw) => {
  appRaw = dataTools.deepCopy(appRaw);
  const extras = convertResourceDos(appRaw);

  appRaw.triggers = _.extend({}, extras.triggers, appRaw.triggers || {});
  appRaw.searches = _.extend({}, extras.searches, appRaw.searches || {});
  appRaw.creates = _.extend({}, extras.creates, appRaw.creates || {});
  appRaw.searchOrCreates = _.extend({}, extras.searchOrCreates, appRaw.searchOrCreates || {});

  _.each(appRaw.triggers, (trigger) => {
    appRaw.triggers[trigger.key] = copyPropertiesFromResource('trigger', trigger, appRaw);
  });

  _.each(appRaw.searches, (search) => {
    appRaw.searches[search.key] = copyPropertiesFromResource('search', search, appRaw);
  });

  _.each(appRaw.creates, (create) => {
    appRaw.creates[create.key] = copyPropertiesFromResource('create', create, appRaw);
  });

  return appRaw;
};

const serializeApp = (compiledApp) => {
  const cleanedApp = cleaner.recurseCleanFuncs(compiledApp);
  return dataTools.jsonCopy(cleanedApp);
};

const validateApp = (compiledApp) => {
  const cleanedApp = cleaner.recurseCleanFuncs(compiledApp);
  const results = zapierSchema.validateAppDefinition(cleanedApp);

  // Check for style guide only if there are no schema errors
  if (results.errors.length === 0) {
    // These aren't ValidationError so it won't "stop" validation, but it will show them in `zapier validate`
    const styleGuideResults = styleGuideChecker.validateAppDefinition(cleanedApp);
    return dataTools.jsonCopy(styleGuideResults.errors);
  }

  return dataTools.jsonCopy(results.errors);
};

const prepareApp = (appRaw) => {
  const compiledApp = compileApp(appRaw);
  return dataTools.deepFreeze(compiledApp);
};

module.exports = {
  compileApp,
  validateApp,
  serializeApp,
  prepareApp
};
