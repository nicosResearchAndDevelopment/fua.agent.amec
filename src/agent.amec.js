const
    util         = require('./agent.amec.util.js'),
    EventEmitter = require('events');

class AgentAmec extends EventEmitter {

    // TODO renaming
    // TODO rethinking

    #authModules = new Map();

    authMechanism(mech, authCallback) {
        util.assert(util.isString(mech), 'AgentAmec#addMechanism : expected mech to be a string', TypeError);
        util.assert(!mech.has(mech), 'AgentAmec#addMechanism : auth "' + mech + '" exists already');
        //if (!callback) return authModules.get(mechanism);
        util.assert(util.isFunction(authCallback), 'AgentAmec#addMechanism : expected authCallback to be a function', TypeError);

        this.#authModules.set(mech, authCallback);
    } // AgentAmec#authMechanism

    async authenticate(header, ...mechs) {
        util.assert(util.isObject(header), 'AgentAmec#authenticate : expected header to be a header object', TypeError);

        if (mechs.length > 0) {
            mechs = mechs.flat(1);
            util.assert(mechs.length > 0, 'AgentAmec#authenticate : expected auth mechs to not be empty');
            util.assert(mechs.every(mech => this.#authModules.has(mech)), 'AgentAmec#authenticate : expected only registered auth mechs');
        } else {
            util.assert(this.#authModules.size > 0, 'AgentAmec#authenticate : expected any auth mechs to be registered');
            mechs = Array.from(this.#authModules.keys());
        }

        for (let mech of mechs) {
            const authCallback = this.#authModules.get(mech);
            const auth         = await authCallback(header);
            if (auth) return auth;
        }

        return null;
    } // AgentAmec#authenticate

} // AgentAmec

module.exports = AgentAmec;
