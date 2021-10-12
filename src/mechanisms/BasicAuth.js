const
    util = require('../agent.amec.util.js');

// SEE https://datatracker.ietf.org/doc/html/rfc7617
// NOTE this is currently only an example !!!
function BasicAuth(config) {
    util.assert(config.space, 'BasicAuth : expected space');

    const
        space          = config.space,
        users          = new Map(),
        refreshTimeout = 60 * 60;

    async function _refreshUsers() {
        try {
            const
                /** @type {import("@nrd/fua.module.persistence").Dataset} */
                userData  = await space.readData(undefined, 'rdf:type', 'domain:UserBasicAuthentication'),
                userNodes = Array.from(userData.subjects()).map(namedNode => space.getNode(namedNode.value));
            await Promise.all(userNodes.map(node => node.read()));
            users.clear();
            for (let userNode of userNodes) {
                const
                    userName     = userNode['domain:name']?.[0],
                    userPassword = userNode['domain:password']?.[0],
                    userActive   = userNode['domain:active']?.[0];
                if (userName?.['@value'] && userPassword?.['@value'] && userActive?.['@value'] === 'true') {
                    users.set(userName['@value'], userNode);
                }
            }
        } catch (err) {
            console.error(err);
        }
    } // _refreshUsers

    _refreshUsers()
        .then(() => setInterval(_refreshUsers, 1e3 * refreshTimeout))
        .catch(console.error);

    function basicAuth(headers) {
        const basicAuth = headers['authorization'];
        // console.log(basicAuth);
        if (!basicAuth.startsWith('Basic ')) return;
        const [name, password] = Buffer.from(basicAuth.substr(6), 'base64').toString().split(':');
        // console.log(name, ':', password);
        if (!(name && password)) return;
        const userNode = users.get(name);
        // console.log(userNode);
        if (!userNode) return;
        const auth = {
            id:       userNode['@id'],
            user:     userNode['domain:name'][0]['@value'],
            password: userNode['domain:password'][0]['@value']
        };
        // console.log(auth);
        // TODO sha256 hashing of password or something like that
        if (auth.password !== password) return;
        return auth;
    } // basicAuth

    return basicAuth;
} // BasicAuth

module.exports = BasicAuth;
