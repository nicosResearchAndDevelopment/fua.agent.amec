const
    {describe, test, before} = require('mocha'),
    expect                   = require('expect'),
    path                     = require('path'),
    util                     = require('@nrd/fua.core.util'),
    AgentAmec                = require('./agent.amec.js'),
    BasicAuth                = require('./mechanisms/BasicAuth.js'),
    {Dataset, DataFactory}   = require('@nrd/fua.module.persistence'),
    Space                    = require(path.join(util.FUA_JS_LIB, 'module.space/next/module.space.js'));

describe('agent.amec', function () {

    test('construct the agent', function () {
        const agent = new AgentAmec();
        expect(agent).toBeInstanceOf(AgentAmec);
    });

    test('register a mechanism', function () {
        const agent = new AgentAmec();
        agent.registerMechanism('basic', (headers) => true);
    });

    test('register the BasicAuth mechanism and authenticate a test user', async function () {
        const
            agent     = new AgentAmec(),
            domain    = {
                users: {
                    async getByAttr(key, value) {
                        return {
                            '@id':          'ex:aladdin',
                            'dom:name':     [{'@value': 'Aladdin', '@type': 'xsd:string'}],
                            'dom:password': [{'@value': 'open sesame', '@type': 'xsd:string'}],
                            'dom:active':   [{'@value': 'true', '@type': 'xsd:boolean'}]
                        };
                    }
                }
            },
            basicAuth = BasicAuth({domain});

        agent.registerMechanism('basic', basicAuth);

        const auth = await agent.authenticate({
            'Authorization': 'Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ==' // 'Aladdin:open sesame'
        });
        console.log(auth);
    });

});
