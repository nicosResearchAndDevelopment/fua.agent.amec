const
    assert        = require('@fua/core.assert'),
    is            = require('@fua/core.is'),
    // {decode}      = require('jose/util/base64url'), // jose@3.x
    // {base64url: {decode}} = require('jose'), // jose@4.x
    Helmut        = require('@fua/agent.helmut'),
    // NOTE maybe jwt.split('.')[0] is the jwt header, then better use jwt.split('.')[1] for the payload instead
    decodePayload = (jwt) => Helmut.base64url(jwt.split('.')[0]).toJSON();

/**
 * @param {{[key: string]: [value: any]}} [config={}]
 * @returns {(function(headers: {[key: string]: [value: string]}): Promise<null | {type: string, datPayload: any, userId: string}>)}
 * @constructor
 */
function DatAuth(config = {}) {
    assert.object(config, {connector: is.boolean.truthy});

    /** @type {{getClient({daps: string}): {validateDat(token: string): Object}}} */
    const connector = config.connector;
    assert.object(connector, {getClient: is.function});
    const authType = config.authType ?? 'DatAuth';
    assert.string(authType);
    const authField = config.authorizationField ?? 'authorization';
    assert.string(authField);
    const authPrefix = config.authPrefix ?? 'Bearer ';
    assert.string(authPrefix);

    async function datAuth(headers) {
        // get the authorization header field
        const authorization = headers[authField];
        // check if the authorization is jwt (bearer)
        if (!authorization) return null;
        if (!authorization.startsWith(authPrefix)) return null;
        const token         = authorization.substring(authPrefix.length);
        // find the right daps client
        const {iss: issuer} = decodePayload(token);
        if (!issuer) return null;
        const client = connector.getClient({daps: issuer});
        if (!client) return null;
        // validate the dat with the client
        const payload = await client.validateDat(token);
        // return an authentication object
        return {
            type:       authType,
            userId:     payload.sub,
            datPayload: payload
        };
    }

    return datAuth;
}

module.exports = DatAuth;
