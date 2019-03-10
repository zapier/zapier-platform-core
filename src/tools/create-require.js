'use-strict';

const { dependencies, devDependencies } = require('../../package.json');
const { RequireModuleError } = require('../errors');

const createRequire = () => module => {
  const libs = Object.keys(dependencies).concat(Object.keys(devDependencies));
  const allowedLibs = ['lodash'];
  const disallowedModules = ['fs', 'child_process'];
  const disallowedLibs = libs.filter(d => !allowedLibs.includes(d));

  if (disallowedModules.includes(module) || disallowedLibs.includes(module)) {
    throw new RequireModuleError(
      `You are attempting to use a disallowed module: "${module}"`
    );
  }

  return require(module);
};

module.exports = createRequire;
