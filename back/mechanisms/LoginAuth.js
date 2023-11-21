const
    util   = require('../agent.amec.util.js'),
    bcrypt = require('bcrypt');

function LoginAuth(config) {
    const
        domain        = config.domain,
        nameField     = 'username',
        passwordField = 'password';
    util.assert(domain, 'LoginAuth : expected domain');

    async function loginAuth(headers) {
        // extract username and password
        const
            name     = headers[nameField],
            password = headers[passwordField];
        if (!(name && password)) return;
        // get the user node from the domain
        const userNode = await domain.users.getByAttr('dom:name', name);
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
            type:     loginAuth.type,
            userId:   userNode.id,
            userName: userName
        };
    } // loginAuth

    loginAuth.type      = LoginAuth.id;
    loginAuth.prefLabel = LoginAuth.prefLabel; // skos

    return Object.freeze(loginAuth);
} // LoginAuth

LoginAuth.id        = 'LoginAuth';
LoginAuth.prefLabel = LoginAuth.id; // skos

module.exports = Object.freeze(LoginAuth);
