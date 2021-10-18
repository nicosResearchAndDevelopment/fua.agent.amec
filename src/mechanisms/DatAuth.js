const
    util = require('../agent.amec.util.js');

function DatAuth(config) {
    const domain = config.domain;
    util.assert(domain, 'DatAuth : expected domain');

    async function datAuth(headers) {
        // get the authorization header field
        const authorization = headers['authorization'];
        // check if the authorization is jwt (bearer)
        if (!authorization.startsWith('Bearer ')) return;
        // TODO find the right daps client
        // TODO validate the dat with the client
        // TODO return an authentication object
        return {
            type:   datAuth.type,
            userId: 'TODO'
        };
    } // datAuth

    datAuth.type      = DatAuth.id;
    datAuth.prefLabel = DatAuth.prefLabel; // skos

    return Object.freeze(datAuth);
} // DatAuth

DatAuth.id        = 'DatAuth';
DatAuth.prefLabel = DatAuth.id; // skos

module.exports = Object.freeze(DatAuth);
