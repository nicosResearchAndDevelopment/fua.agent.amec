const
    {describe, test, before} = require('mocha'),
    expect                   = require('expect'),
    path                     = require('path'),
    util                     = require('@nrd/fua.core.util'),
    AgentAmec                = require('../src/agent.amec.js'),
    BasicAuth                = require('../src/mechanisms/BasicAuth.js'),
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
        this.timeout(5e3);

        const
            agent     = new AgentAmec(),
            context   = {
                rdf:    'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
                rdfs:   'http://www.w3.org/2000/01/rdf-schema#',
                owl:    'http://www.w3.org/2002/07/owl#',
                dct:    'http://purl.org/dc/terms/',
                foaf:   'http://xmlns.com/foaf/0.1/',
                xsd:    'http://www.w3.org/2001/XMLSchema#',
                org:    'http://www.w3.org/ns/org#',
                domain: 'https://www.nicos-rd.com.org/fua/domain#',
                nrd:    'https://www.nicos-rd.com/',
                ex:     'https://www.example.com/'
            },
            factory   = new DataFactory(context),
            quads     = [
                factory.quad(factory.namedNode('ex:aladdin'), factory.namedNode('rdf:type'), factory.namedNode('domain:UserBasicAuthentication')),
                factory.quad(factory.namedNode('ex:aladdin'), factory.namedNode('domain:name'), factory.literal('Aladdin')),
                factory.quad(factory.namedNode('ex:aladdin'), factory.namedNode('domain:password'), factory.literal('open sesame')),
                factory.quad(factory.namedNode('ex:aladdin'), factory.namedNode('domain:active'), factory.literal('true', factory.namedNode('xsd:boolean')))
            ],
            dataset   = new Dataset(quads, factory),
            space     = new Space({dataset}),
            basicAuth = BasicAuth({space});

        agent.registerMechanism('basic', basicAuth);
        await new Promise(resolve => setTimeout(resolve, 1e3));

        const auth = await agent.authenticate({
            'Authorization': 'Basic QWxhZGRpbjpvcGVuIHNlc2FtZQ==' // 'Aladdin:open sesame'
        });
        console.log(auth);
    });

});
