const
    util = require('../agent.amec.util.js');

// SEE https://datatracker.ietf.org/doc/html/rfc7617
function BasicAuth(config) {
    const domain = config.domain;
    util.assert(domain, 'BasicAuth : expected domain');

    async function basicAuth(headers) {
        // get the authorization header field
        const authorization = headers['authorization'];
        // check if the authorization is basic
        if (!authorization.startsWith('Basic ')) return;
        // extract username and password
        const [name, password] = Buffer.from(authorization.substr(6), 'base64').toString().split(':');
        if (!(name && password)) return;
        // get the user node from the domain
        const userNode = await domain.users.getByAttr('dom:name', name);
        if (!userNode) return;
        // get the real user and password
        const
            userName     = userNode.getLiteral('dom:name').value,
            userPassword = userNode.getLiteral('dom:password').value;
        // TODO : bcrypt hashing of password
        // compare the password with the real password
        if (userPassword !== password) return;
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
