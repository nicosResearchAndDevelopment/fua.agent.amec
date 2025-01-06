const
    {describe, test, before} = require('mocha'),
    expect                   = require('expect'),
    path                     = require('path'),
    Helmut                   = require('@fua/agent.helmut'),
    Space                    = require('@fua/agent.space'),
    Domain                   = require('@fua/agent.domain'),
    Amec                     = require('../src/amec.js');

describe('fua.agent.amec', function () {

    this.timeout('30s');

    before('init', async function () {
        await Space.initialize({
            context: {
                'ids':  'https://w3id.org/idsa/core/',
                'idsc': 'https://w3id.org/idsa/code/',
                'fua':  'https://www.nicos-rd.com/fua#',
                'dom':  'https://www.nicos-rd.com/fua/domain#',
                'ecm':  'https://www.nicos-rd.com/fua/ecosystem#',
                'daps': 'https://www.nicos-rd.com/fua/daps#'
            },
            store:   {
                module:  'filesystem',
                options: {
                    defaultFile: 'file://domain.ttl',
                    loadFiles:   [{
                        '@id':            'file://domain.ttl',
                        'dct:identifier': path.join(__dirname, 'data/domain.ttl'),
                        'dct:format':     'text/turtle'
                    }]
                }
            }
        });
        await Helmut.initialize({});
        await Domain.initialize({
            uri: 'http://localhost/domain/'
        });
        await Amec.initialize({
            mechanisms: [{
                authType:     'BasicAuth',
                usernameAttr: 'dom:name',
                passwordAttr: 'dom:password'
            }]
        });
    });

    test('develop', async function () {
        const auth = await Amec.authenticate({
            'Authorization': 'Basic ' + Helmut.utf8('test-user:test-password').toBase64()
        });
        console.log(auth);
    });

});
