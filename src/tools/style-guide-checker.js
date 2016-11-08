'use strict';

const _ = require('lodash');

const buildError = (message, property) => {
  return { message, property: `App.${property}` };
};

const isTitleCase = (label) => {
  // TODO: Make this more strict
  return (label[0] === label[0].toUpperCase());
};

const checkForBadLabelsIn = (type, app, errors) => {
  // Check for "bad" labels
  const keysWithBadLabels = _.keys(app[type]).filter((key) => {
    return !isTitleCase(app[type][key].display.label);
  });

  if (keysWithBadLabels) {
    keysWithBadLabels.forEach((key) => {
      errors.push(buildError(`Labels should be TitleCase. Found "${app[type][key].display.label}".`, `${type}.${key}.display.label`));
    });
  }
};

const checkForSampleDataIn = (type, app, errors) => {
  // Check Sample data exists
  const keysWithoutSampleData = _.keys(app[type]).filter((key) => {
    return !_.isObject(app[type][key].operation.sample);
  });

  if (keysWithoutSampleData) {
    const capitalizedType = type[0].toUpperCase() + type.substr(1);

    keysWithoutSampleData.forEach((key) => {
      errors.push(buildError(`${capitalizedType} should always have sample data.`, `${type}.${key}.operation.sample`));
    });
  }
};

// Check for common style guide issues
const validateAppDefinition = (app) => {
  const errors = [];

  // Check for "bad" labels
  checkForBadLabelsIn('triggers', app, errors);
  checkForBadLabelsIn('searches', app, errors);
  checkForBadLabelsIn('creates', app, errors);

  // Check for sample data
  checkForSampleDataIn('triggers', app, errors);
  checkForSampleDataIn('searches', app, errors);
  checkForSampleDataIn('creates', app, errors);

  return {
    errors
  };
};

module.exports = {
  validateAppDefinition
};
