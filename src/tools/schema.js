'use strict';

const _ = require('lodash');
const cleaner = require('./cleaner');
const dataTools = require('./data');
const zapierSchema = require('zapier-platform-schema');

// Take a resource with methods like list/hook and turn it into triggers, etc.
const convertResourceDos = (appRaw) => {
  let triggers = {}, searches = {}, creates = {};

  _.each(appRaw.resources, (resource) => {
    if (resource.hook && resource.hook.operation) {
      let trigger = dataTools.deepCopy(resource.hook);
      trigger.key = `${resource.key}Hook`;
      trigger.noun = resource.noun;
      trigger.operation.resource = resource.key;
      trigger.operation.type = 'hook';
      trigger.operation.outputFields = trigger.operation.outputFields || resource.outputFields;
      if (resource.list && resource.list.operation && resource.list.operation.perform) {
        trigger.operation.performList = trigger.operation.performList || resource.list.operation.perform;
      }
      triggers[trigger.key] = trigger;
    }

    if (resource.list && resource.list.operation) {
      let trigger = dataTools.deepCopy(resource.list);
      trigger.key = `${resource.key}List`;
      trigger.noun = resource.noun;
      trigger.operation.resource = resource.key;
      trigger.operation.type = 'polling';
      trigger.operation.outputFields = trigger.operation.outputFields || resource.outputFields;
      triggers[trigger.key] = trigger;
    }

    if (resource.search && resource.search.operation) {
      let search = dataTools.deepCopy(resource.search);
      search.key = `${resource.key}Search`;
      search.noun = resource.noun;
      search.operation.resource = resource.key;
      if (resource.get && resource.get.operation && resource.get.operation.perform) {
        search.operation.performGet = search.operation.performGet || resource.get.operation.perform;
      }
      search.operation.outputFields = search.operation.outputFields || resource.outputFields;
      searches[search.key] = search;
    }

    if (resource.create && resource.create.operation) {
      let create = dataTools.deepCopy(resource.create);
      create.key = `${resource.key}Create`;
      create.noun = resource.noun;
      create.operation.resource = resource.key;
      if (resource.get && resource.get.operation && resource.get.operation.perform) {
        create.operation.performGet = create.operation.performGet || resource.get.operation.perform;
      }
      create.operation.outputFields = create.operation.outputFields || resource.outputFields;
      creates[create.key] = create;
    }

    // TODO: search or create?
  });

  return { triggers, searches, creates };
};

/* When a trigger/search/create (action) links to a resource, we walk up to
 * the resource and copy missing properties from resource to the action.
 */
const copyPropertiesFromResource = (type, action, appRaw) => {
  if (appRaw.resources && action.operation && appRaw.resources[action.operation.resource]) {
    const copyableProperties = ['outputFields', 'sample'];
    const resource = appRaw.resources[action.operation.resource];

    if (type === 'trigger' && action.operation.type === 'hook') {
      if (resource.list && resource.list.operation && resource.list.operation.perform) {
        action.operation.performList = action.operation.performList || resource.list.operation.perform;
      }
    } else if (type === 'search' || type === 'create') {
      if (resource.get && resource.get.operation && resource.get.operation.perform) {
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

  _.each(appRaw.triggers, (trigger) => {
    appRaw.triggers[trigger.key] = copyPropertiesFromResource('trigger', trigger, appRaw);
  });

  _.each(appRaw.searches, (search) => {
    appRaw.searches[search.key] = copyPropertiesFromResource('search', search, appRaw);
  });

  _.each(appRaw.creates, (create) => {
    appRaw.creates[create.key] = copyPropertiesFromResource('create', create, appRaw);
  });

  appRaw.triggers = _.extend({}, appRaw.triggers || {}, extras.triggers);
  appRaw.searches = _.extend({}, appRaw.searches || {}, extras.searches);
  appRaw.creates = _.extend({}, appRaw.creates || {}, extras.creates);
  return appRaw;
};

const serializeApp = (compiledApp) => {
  const cleanedApp = cleaner.recurseCleanFuncs(compiledApp);
  return dataTools.jsonCopy(cleanedApp);
};

const validateApp = (compiledApp) => {
  const cleanedApp = cleaner.recurseCleanFuncs(compiledApp);
  const results = zapierSchema.validateAppDefinition(cleanedApp);
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
