'use strict';

/*
  An example checker, we still have lots TODO:
   * compare trigger, search, action result to resource.sample if available
   * validate returned inputFields to schema
   * etc...
*/
export const exampleChecker: Check = {
  name: 'exampleChecker',
  shouldRun: (method/*, bundle*/) => {
    return method && true ? true : false;
  },
  run: (method, results) => {
    if (results) {
      // could return ['Bad thing!'];
      return [];
    }
    return [];
  }
};
