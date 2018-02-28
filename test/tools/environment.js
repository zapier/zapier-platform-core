const should = require('should');
const mock = require('mock-fs');

const tools = require('../../src/tools/exported');
let env;

describe.only('read env', () => {
  beforeEach(() => {
    env = Object.assign({}, process.env);
  });

  it('should should only read .env', done => {
    mock({
      '.environment': 'CITY="boulder"\nNAME="david"\n',
      '.env': 'PIZZA="Blackjack"\n',
      secrets: 'SECRET=very_secret_thing'
    });

    tools.env.inject();
    process.env.PIZZA.should.equal('Blackjack');
    should.not.exist(process.env.CITY);
    done();
  });

  // this is temporary in v6, removed for v7
  it('should read .environment if .env is missing', done => {
    mock({
      '.environment': 'CITY="boulder"\nNAME="david"\n'
    });

    tools.env.inject();
    process.env.CITY.should.equal('boulder');
    should.not.exist(process.env.PIZZA);
    done();
  });

  it('should parse a with filename, ignore defaults', done => {
    mock({
      '.environment': 'CITY="boulder"\nNAME="david"\n',
      '.env': 'PIZZA="Blackjack"\n',
      secrets: 'SECRET=very_secret_thing'
    });

    tools.env.inject('secrets');
    process.env.SECRET.should.equal('very_secret_thing');
    should.not.exist(process.env.CITY);
    should.not.exist(process.env.PIZZA);
    done();
  });

  afterEach(() => {
    mock.restore();
    process.env = env;
  });
});
