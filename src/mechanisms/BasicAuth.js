const
    util = require('../agent.amec.util.js');

// SEE https://datatracker.ietf.org/doc/html/rfc7617
// NOTE this is currently only an example !!!
function BasicAuth(config) {
    util.assert(config.space, 'BasicAuth : expected space');

    // get the space and create a users map for faster access
    const
        space          = config.space,
        users          = new Map(),
        refreshTimeout = 60 * 60;

    /**
     * This method fetches the users from the space and puts them into a map.
     * @returns {Promise<void>}
     * @private
     */
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

    // refreshing users with data from the space is asynchronous
    _refreshUsers()
        .then(() => setInterval(_refreshUsers, 1e3 * refreshTimeout))
        .catch(console.error);

    function basicAuth(headers) {
        // get the authorization header field
        const basicAuth = headers['authorization'];
        // check if the authorization is basic
        if (!basicAuth.startsWith('Basic ')) return;
        // extract username and password
        const [name, password] = Buffer.from(basicAuth.substr(6), 'base64').toString().split(':');
        if (!(name && password)) return;
        // get the user node from the pre fetched map
        const userNode = users.get(name);
        if (!userNode) return;
        // get the real user and password
        const auth = {
            id:       userNode['@id'],
            user:     userNode['domain:name'][0]['@value'],
            password: userNode['domain:password'][0]['@value']
        };
        // TODO sha256 hashing of password or something like that
        // compare the password with the real password
        if (auth.password !== password) return;
        // return an authentication object
        return auth;
    } // basicAuth

    return basicAuth;
} // BasicAuth

module.exports = BasicAuth;
