const
    {describe, test, before} = require('mocha'),
    expect                   = require('expect'),
    AgentAmec                = require('../src/agent.amec.js');

describe('agent.amec', function () {

    let agent;
    before('construct AgentAmec', function () {
        agent = new AgentAmec();
    });

    test('agent instanceof AgentAmec', function () {
        expect(agent).toBeInstanceOf(AgentAmec);
    });

});
