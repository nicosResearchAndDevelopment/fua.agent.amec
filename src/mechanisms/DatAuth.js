const
    util          = require('../agent.amec.util.js'),
    {decode}      = require('jose/util/base64url'),
    decodePayload = (jwt) => JSON.parse(decode(jwt.split('.')[0]));

function DatAuth(config) {
    const connector = config.connector;
    util.assert(connector, 'DatAuth : expected connector');

    async function datAuth(headers) {
        // get the authorization header field
        const authorization = headers['authorization'];
        // check if the authorization is jwt (bearer)
        if (!authorization) return;
        if (!authorization.startsWith('Bearer ')) return;
        const token         = authorization.substr(7);
        // find the right daps client
        const {iss: issuer} = decodePayload(token);
        if (!issuer) return;
        const client = connector.getClient({daps: issuer});
        if (!client) return;
        // validate the dat with the client
        const payload = await client.validateDat(token);
        // return an authentication object
        return {
            type:       datAuth.type,
            userId:     payload.sub,
            datPayload: payload
        };
    } // datAuth

    datAuth.type      = DatAuth.id;
    datAuth.prefLabel = DatAuth.prefLabel; // skos

    return Object.freeze(datAuth);
} // DatAuth

DatAuth.id        = 'https://www.nicos-rd.com/fua/amec/DatAuth/';
DatAuth.prefLabel = 'DatAuth'; // skos

module.exports = Object.freeze(DatAuth);
