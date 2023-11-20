const
    assert = require('@nrd/fua.core.assert'),
    Domain = require('@nrd/fua.agent.domain/v2'),
    Helmut = require('@nrd/fua.agent.helmut'),
    bcrypt = require('bcrypt');

/**
 * @param {{[key: string]: [value: any]}} [config={}]
 * @returns {function(headers: {[key: string]: [value: string]}): Promise<null | {type: string, userName: string, userId: string}>}
 * @constructor
 * @see https://datatracker.ietf.org/doc/html/rfc7617
 */
function BasicAuth(config = {}) {
    assert.object(config);

    const authType = config.authType ?? 'BasicAuth';
    assert.string(authType);
    const authField = config.authorizationField ?? 'authorization';
    assert.string(authField);
    const authPrefix = config.authPrefix ?? 'Basic ';
    assert.string(authPrefix);
    const usernameAttr = config.usernameAttr ?? 'dom:name';
    assert.string(usernameAttr);
    const passwordAttr = config.passwordAttr ?? 'dom:password';
    assert.string(passwordAttr);

    async function basicAuth(headers) {
        // get the authorization header field
        const authorization = headers[authField];
        // check if the authorization is basic
        if (!authorization) return null;
        if (!authorization.startsWith(authPrefix)) return null;
        // extract username and password
        const [name, password] = Helmut.base64(authorization.substring(authPrefix.length)).toUtf8().split(':');
        if (!(name && password)) return null;
        // get the user node from the Domain
        const userNode = await Domain.getUserByAttribute(usernameAttr, name);
        if (!userNode) return null;
        // get the real user and password and compare with submitted password
        const
            userName     = userNode.getLiteral(usernameAttr).value,
            userPassword = userNode.getLiteral(passwordAttr).value,
            // passValid    = (password === userPassword),
            passValid    = await bcrypt.compare(password, userPassword);
        if (!passValid) return null;
        // return an authentication object
        return {
            type:     authType,
            userId:   userNode.id,
            userName: userName
        };
    }

    return basicAuth;
}

module.exports = BasicAuth;
