'use-strict';

const _ = require('lodash');
const { dependencies } = require('../../package.json');
const schemaVersion = dependencies['zapier-platform-schema'];

const applyVersion800 = compiled => {
  // I see we also have data.deepCopy. Is that just to get functions?
  // We could also bring in a lib like qim or immer to perform immutable updates to the definition.
  const appCopy = _.cloneDeep(compiled);
  const changes = ['triggers', 'creates', 'searches'];

  const omitEmptyParamsToRemoveMissingValues = app => {
    // No easy way to loop through all places `omitEmptyParams` might be without
    // visiting all service (ie Trigger etc.) nodes
    changes.forEach(serviceName => {
      Object.values(appCopy[serviceName]).forEach(service => {
        const { omitEmptyParams } = service.operation.perform;

        if (omitEmptyParams) {
          delete service.operation.perform.omitEmptyParams;
          service.operation.perform.removeMissingValuesFrom = {
            params: omitEmptyParams
          };
        }
      });
    });

    return app;
  };

  // We can stack up different transforms here.
  // Not sure if we'd be in a state where an integration might be many breaking changes behind?
  // Hopefully not...
  return omitEmptyParamsToRemoveMissingValues(appCopy);
};

const schemaVersionHandlers = {
  '8.0.0': applyVersion800
};

const resolveVersion = compiledApp => {
  if (compiledApp.version >= schemaVersion) {
    return compiledApp;
  }

  const defaultHandler = rawApp => rawApp;
  const handleVersion = schemaVersionHandlers[schemaVersion] || defaultHandler;

  return handleVersion(compiledApp);
};

module.exports = resolveVersion;
