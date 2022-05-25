const
    util        = require('../agent.amec.util.js'),
    DomainAgent = require('@nrd/fua.agent.domain'),
    bcrypt      = require('bcrypt');

// SEE https://datatracker.ietf.org/doc/html/rfc7617
function BasicAuth(config) {
    const domain = config.domain;
    util.assert(domain instanceof DomainAgent, 'BasicAuth : expected domain to be instance of DomainAgent');

    async function basicAuth(headers) {
        // get the authorization header field
        const authorization = headers['authorization'];
        // check if the authorization is basic
        if (!authorization) return;
        if (!authorization.startsWith('Basic ')) return;
        // extract username and password
        const [name, password] = Buffer.from(authorization.substr(6), 'base64').toString().split(':');
        if (!(name && password)) return;
        // get the user node from the domain
        // TODO replace old domain method (users.getByAttr) to only use the new domain method (getUserByAttribute)
        const userNode = await domain.getUserByAttribute('dom:name', name);
        if (!userNode) return;
        // get the real user and password and compare with submitted password
        const
            userName     = userNode.getLiteral('dom:name').value,
            userPassword = userNode.getLiteral('dom:password').value,
            // passValid    = (password === userPassword),
            passValid    = await bcrypt.compare(password, userPassword);
        if (!passValid) return;
        // return an authentication object
        return {
            type:     basicAuth.type,
            userId:   userNode.id,
            userName: userName
        };
    } // basicAuth

    basicAuth.type      = BasicAuth.id;
    basicAuth.prefLabel = BasicAuth.prefLabel; // skos

    return Object.freeze(basicAuth);
} // BasicAuth

BasicAuth.id        = 'BasicAuth';
BasicAuth.prefLabel = BasicAuth.id; // skos

module.exports = Object.freeze(BasicAuth);
