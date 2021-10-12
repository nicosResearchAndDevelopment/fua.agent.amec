// SEE https://datatracker.ietf.org/doc/html/rfc7617
function BasicAuth(config) {
    const domain = config.domain;
    if (!domain) throw new Error('BasicAuth : expected domain');

    async function basicAuth(headers) {
        // get the authorization header field
        const basicAuth = headers['authorization'];
        // check if the authorization is basic
        if (!basicAuth.startsWith('Basic ')) return;
        // extract username and password
        const [name, password] = Buffer.from(basicAuth.substr(6), 'base64').toString().split(':');
        if (!(name && password)) return;
        // get the user node from the domain
        const userNode = await domain.users.getByAttr('dom:name', name);
        if (!userNode) return;
        // get the real user and password
        const auth = {
            id:       userNode['@id'],
            user:     userNode['dom:name']?.[0]?.['@value'],
            password: userNode['dom:password']?.[0]?.['@value']
        };
        // TODO sha256 hashing of password or something like that
        // compare the password with the real password
        if (auth.password !== password) return;
        // return an authentication object
        //return auth;
        return {
            id:   auth.id,
            type: "BasicAuthUser", // TODO: make it better!!!
            user: auth.user
        };
        // return userNode;
    } // basicAuth

    Object.defineProperties(basicAuth, {
        type:                  {value: "BasicAuth", enumerable: true},
        /** skos */ prefLabel: {value: "BasicAuth", enumerable: true}
    }); // Object.defineProperties(BasicAuth

    return basicAuth;
} // BasicAuth

Object.defineProperties(BasicAuth, {
    /** skos */ prefLabel: {value: "BasicAuth", enumerable: true}
}); // Object.defineProperties(BasicAuth

Object.freeze(BasicAuth);
module.exports = BasicAuth;
