'use strict';

const should = require('should');
const schema = require('../../src/tools/schema');

describe('schema', () => {
  describe.only('handles version mismatches', () => {
    describe('version 8.0.0', () => {
      it('makes no changes if the app is set to the current version', () => {
        const appRaw = {
          platformVersion: '8.0.0',
          version: '8.0.0',
          triggers: {
            fastFoo: {
              key: 'fastFoo',
              noun: 'Foo',
              display: {
                label: 'Fast Foo',
                description: 'A foo but faster'
              },
              operation: {
                perform: {
                  url: 'https://api.example.com'
                }
              }
            }
          },
          creates: {},
          searches: {},
          searchOrCreates: {}
        };

        const preparedApp = schema.prepareApp(appRaw);
        preparedApp.should.eql(appRaw);

        const errors = schema.validateApp(appRaw);
        errors.should.eql([]);
      });

      it('sets removeMissingValuesFrom based on omitEmptyParams', () => {
        const appRaw = {
          platformVersion: '7.6.1',
          version: '7.6.1',
          triggers: {
            fastFoo: {
              key: 'fastFoo',
              noun: 'Foo',
              display: {
                label: 'Fast Foo',
                description: 'A foo but faster'
              },
              operation: {
                perform: {
                  url: 'https://api.example.com',
                  omitEmptyParams: true
                }
              }
            }
          }
        };

        const preparedApp = schema.prepareApp(appRaw);
        const { perform } = preparedApp.triggers.fastFoo.operation;
        should(perform.omitEmptyParams).eql(undefined);
        perform.removeMissingValuesFrom.should.eql({ params: true });

        const rawErrors = schema.validateApp(appRaw);
        rawErrors.should.have.length(1);

        const preparedErrors = schema.validateApp(preparedApp);
        preparedErrors.should.eql([]);
      });

      it('does nothing if omitEmptyParams is not included', () => {
        const appRaw = {
          platformVersion: '7.6.1',
          version: '7.6.1',
          triggers: {
            fastFoo: {
              key: 'fastFoo',
              noun: 'Foo',
              display: {
                label: 'Fast Foo',
                description: 'A foo but faster'
              },
              operation: {
                perform: {
                  url: 'https://api.example.com'
                }
              }
            }
          },
          creates: {},
          searches: {},
          searchOrCreates: {}
        };

        const preparedApp = schema.prepareApp(appRaw);
        preparedApp.should.eql(appRaw);

        const preparedErrors = schema.validateApp(preparedApp);
        preparedErrors.should.eql([]);
      });
    });
  });

  describe('compileApp on a resource', () => {
    it('should handle blank methods', () => {
      const appRaw = {
        resources: {
          foo: {
            key: 'foo',
            noun: 'Foo',
            hook: {},
            list: {},
            search: {},
            create: {}
          }
        }
      };
      const compiledApp = schema.compileApp(appRaw);
      compiledApp.should.containEql({
        triggers: {},
        creates: {},
        searches: {}
      });
    });

    it('should populate generated triggers/searches/creates with properties from resource', () => {
      const dummyMethod = {
        operation: {
          perform: () => {
            return {};
          }
        }
      };

      const appRaw = {
        resources: {
          foo: {
            key: 'foo',
            noun: 'Foo',
            hook: dummyMethod,
            list: dummyMethod,
            search: dummyMethod,
            create: dummyMethod,
            outputFields: [
              { key: 'id', type: 'integer' },
              { key: 'name', type: 'string' }
            ],
            sample: {
              id: 123,
              name: 'John Doe'
            }
          }
        }
      };
      const compiledApp = schema.compileApp(appRaw);
      compiledApp.triggers.fooList.operation.outputFields.should.have.length(2);
      compiledApp.triggers.fooList.operation.sample.should.have.keys(
        'id',
        'name'
      );
      compiledApp.searches.fooSearch.operation.outputFields.should.have.length(
        2
      );
      compiledApp.searches.fooSearch.operation.sample.should.have.keys(
        'id',
        'name'
      );
      compiledApp.creates.fooCreate.operation.outputFields.should.have.length(
        2
      );
      compiledApp.creates.fooCreate.operation.sample.should.have.keys(
        'id',
        'name'
      );
    });

    it('should populate generated searchOrCreate from resource', () => {
      const dummySearch = {
        display: {
          label: 'Find a Foo',
          description: 'Finds a Foo.'
        },
        operation: {
          perform: () => {
            return {};
          }
        }
      };

      const dummyCreate = {
        display: {
          label: 'Create a Foo',
          description: 'Creates a Foo.'
        },
        operation: {
          perform: () => {
            return {};
          }
        }
      };

      const appRaw = {
        resources: {
          foo: {
            key: 'foo',
            noun: 'Foo',
            search: dummySearch,
            create: dummyCreate,
            outputFields: [
              { key: 'id', type: 'integer' },
              { key: 'name', type: 'string' }
            ],
            sample: {
              id: 123,
              name: 'John Doe'
            }
          }
        }
      };
      const compiledApp = schema.compileApp(appRaw);
      compiledApp.searchOrCreates.should.have.keys('fooSearch');
      compiledApp.searchOrCreates.fooSearch.should.eql({
        key: 'fooSearch',
        display: {
          label: 'Find or Create Foo',
          description: 'Finds a Foo.'
        },
        search: 'fooSearch',
        create: 'fooCreate'
      });
    });

    it('should not make a searchOrCreate if either is hidden', () => {
      const dummySearch = {
        display: {
          label: 'Find a Foo',
          description: 'Finds a Foo.'
        },
        operation: {
          perform: () => {
            return {};
          }
        }
      };

      const dummyCreate = {
        display: {
          label: 'Create a Foo',
          description: 'Creates a Foo.',
          hidden: true
        },
        operation: {
          perform: () => {
            return {};
          }
        }
      };

      const appRaw = {
        resources: {
          foo: {
            key: 'foo',
            noun: 'Foo',
            search: dummySearch,
            create: dummyCreate,
            outputFields: [
              { key: 'id', type: 'integer' },
              { key: 'name', type: 'string' }
            ],
            sample: {
              id: 123,
              name: 'John Doe'
            }
          }
        }
      };
      const compiledApp = schema.compileApp(appRaw);
      compiledApp.searchOrCreates.should.deepEqual({});
    });

    it("should populate hook's performList from list method if available", () => {
      const appRaw = {
        resources: {
          foo: {
            key: 'foo',
            noun: 'Foo',
            hook: {
              display: {},
              operation: {}
            },
            list: {
              display: {},
              operation: {
                perform: { url: 'http://local.dev/items' }
              }
            }
          }
        }
      };
      const compiledApp = schema.compileApp(appRaw);
      compiledApp.triggers.fooHook.operation.should.containEql({
        performList: { url: 'http://local.dev/items' }
      });
    });

    it("should not overwrite hook's existing performList with list method", () => {
      const appRaw = {
        resources: {
          foo: {
            key: 'foo',
            noun: 'Foo',
            hook: {
              display: {},
              operation: {
                performList: { url: 'http://local.dev/items-for-hook' }
              }
            },
            list: {
              display: {},
              operation: {
                perform: { url: 'http://local.dev/items' }
              }
            }
          }
        }
      };
      const compiledApp = schema.compileApp(appRaw);
      compiledApp.triggers.fooHook.operation.should.containEql({
        performList: { url: 'http://local.dev/items-for-hook' }
      });
    });

    it("should populate search's performGet from get method if available", () => {
      const appRaw = {
        resources: {
          foo: {
            key: 'foo',
            noun: 'Foo',
            get: {
              display: {},
              operation: {
                perform: {
                  url: 'http://local.dev/items/{{bundle.inputData.id}}'
                }
              }
            },
            search: {
              display: {},
              operation: {}
            }
          }
        }
      };
      const compiledApp = schema.compileApp(appRaw);
      compiledApp.searches.fooSearch.operation.should.containEql({
        performGet: { url: 'http://local.dev/items/{{bundle.inputData.id}}' }
      });
    });

    it("should not overwrite search's existing performGet with get method", () => {
      const appRaw = {
        resources: {
          foo: {
            key: 'foo',
            noun: 'Foo',
            get: {
              display: {},
              operation: {
                perform: {
                  url: 'http://local.dev/items/{{bundle.inputData.id}}'
                }
              }
            },
            search: {
              display: {},
              operation: {
                performGet: {
                  url:
                    'http://local.dev/items-for-search/{{bundle.inputData.id}}'
                }
              }
            }
          }
        }
      };
      const compiledApp = schema.compileApp(appRaw);
      compiledApp.searches.fooSearch.operation.should.containEql({
        performGet: {
          url: 'http://local.dev/items-for-search/{{bundle.inputData.id}}'
        }
      });
    });
  });

  describe('compileApp', () => {
    it('should populate hook trigger performList when resource is linked', () => {
      const appRaw = {
        resources: {
          foo: {
            list: {
              display: {},
              operation: {
                perform: { url: 'http://local.dev/items' }
              }
            }
          }
        },
        triggers: {
          fastFoo: {
            key: 'fastFoo',
            noun: 'Foo',
            display: {},
            operation: {
              resource: 'foo',
              type: 'hook'
            }
          }
        }
      };
      const compiledApp = schema.compileApp(appRaw);
      compiledApp.triggers.fastFoo.operation.should.containEql({
        performList: { url: 'http://local.dev/items' }
      });
    });

    it('should populate search with properties from linked resource', () => {
      const appRaw = {
        resources: {
          foo: {
            key: 'foo',
            noun: 'Foo',
            get: {
              display: {},
              operation: {
                perform: {
                  url: 'http://local.dev/items/{{bundle.inputData.id}}'
                }
              }
            },
            outputFields: [{ key: 'id' }, { key: 'name' }],
            sample: {
              id: 123,
              name: 'John Doe'
            }
          }
        },
        searches: {
          findFoo: {
            display: {},
            operation: {
              resource: 'foo'
            }
          }
        }
      };
      const compiledApp = schema.compileApp(appRaw);
      compiledApp.searches.findFoo.operation.should.containEql({
        performGet: { url: 'http://local.dev/items/{{bundle.inputData.id}}' }
      });
      compiledApp.searches.findFoo.operation.outputFields.should.have.length(2);
      compiledApp.searches.findFoo.operation.sample.should.have.keys(
        'id',
        'name'
      );
    });

    it('should populate create with properties from linked resource', () => {
      const appRaw = {
        resources: {
          foo: {
            key: 'foo',
            noun: 'Foo',
            get: {
              display: {},
              operation: {
                perform: {
                  url: 'http://local.dev/items/{{bundle.inputData.id}}'
                }
              }
            },
            outputFields: [{ key: 'id' }, { key: 'name' }],
            sample: {
              id: 123,
              name: 'John Doe'
            }
          }
        },
        creates: {
          makeFoo: {
            display: {},
            operation: {
              resource: 'foo'
            }
          }
        }
      };
      const compiledApp = schema.compileApp(appRaw);
      compiledApp.creates.makeFoo.operation.should.containEql({
        performGet: { url: 'http://local.dev/items/{{bundle.inputData.id}}' }
      });
      compiledApp.creates.makeFoo.operation.outputFields.should.have.length(2);
      compiledApp.creates.makeFoo.operation.sample.should.have.keys(
        'id',
        'name'
      );
    });

    it('should error when there is a collision', () => {
      const appRaw = {
        resources: {
          foo: {
            key: 'foo',
            list: {
              operation: {},
              display: {}
            }
          }
        },
        triggers: {
          fooList: {
            key: 'fooList',
            operation: {},
            display: {}
          }
        }
      };

      const buildFunc = () => schema.compileApp(appRaw);
      buildFunc.should.throw();
    });
  });
});
