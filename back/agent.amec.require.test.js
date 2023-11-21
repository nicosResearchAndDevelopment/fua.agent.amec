const
    {describe, test} = require('mocha'),
    expect           = require('expect');

describe('agent.amec -> require', function () {

    test('require("@nrd/fua.agent.amec")', function () {
        const AgentAmec = require('@nrd/fua.agent.amec');
        expect(typeof AgentAmec).toBe('function');
        console.log(AgentAmec);
    });

    test('require("@nrd/fua.agent.amec/BasicAuth")', function () {
        const BasicAuth = require('@nrd/fua.agent.amec/BasicAuth');
        expect(typeof BasicAuth).toBe('function');
        console.log(BasicAuth);
    });

    test('require("@nrd/fua.agent.amec/DatAuth")', function () {
        const DatAuth = require('@nrd/fua.agent.amec/DatAuth');
        expect(typeof DatAuth).toBe('function');
        console.log(DatAuth);
    });

});
