const
    util         = require('./agent.amec.util.js'),
    EventEmitter = require('events');

class AgentAmec extends EventEmitter {

    #authenticators = new Map();

    /**
     * @param {string} mechanism
     * @param {function(headers: {[key: string]: string}): any | Promise<any>} authenticator
     * @returns {this}
     */
    registerMechanism(mechanism, authenticator) {
        util.assert(util.isString(mechanism), 'AgentAmec#registerMechanism : expected mechanism to be a string', TypeError);
        util.assert(util.isFunction(authenticator), 'AgentAmec#registerMechanism : expected authenticator to be a function', TypeError);
        util.assert(!this.#authenticators.has(mechanism), 'AgentAmec#registerMechanism : "' + mechanism + '" already registered');
        this.#authenticators.set(mechanism, authenticator);
        return this;
    } // AgentAmec#registerMechanism

    /**
     * @param {{[key: string]: string}} headers
     * @param {...(string|Array<string>)} mechanisms
     * @returns {Promise<any|null>} authentication
     */
    async authenticate(headers, ...mechanisms) {
        // validate headers and string values
        util.assert(util.isObject(headers), 'AgentAmec#authenticate : expected headers to be an object', TypeError);
        const fields = Object.entries(headers);
        util.assert(fields.length > 0 && fields.every(([key, value]) => util.isString(value)),
            'AgentAmec#authenticate : the headers must not be empty and contain only string values');
        // make a new independent frozen header object with lower case keys
        headers = Object.freeze(Object.fromEntries(fields.map(([key, value]) => [key.toLowerCase(), value])));

        if (mechanisms.length > 0) {
            // if mechanisms are requested, check their existence
            mechanisms = mechanisms.flat(1);
            util.assert(mechanisms.length > 0, 'AgentAmec#authenticate : expected auth mechanisms to not be empty');
            util.assert(mechanisms.every(mechanism => this.#authenticators.has(mechanism)),
                'AgentAmec#authenticate : expected only registered auth mechanisms');
        } else {
            // else validate if any mechanisms are registered
            util.assert(this.#authenticators.size > 0, 'AgentAmec#authenticate : expected any auth mechanisms to be registered');
            mechanisms = Array.from(this.#authenticators.keys());
        }

        for (let mechanism of mechanisms) {
            try {
                // try for each requested mechanism to authenticate
                const
                    authenticator  = this.#authenticators.get(mechanism),
                    authentication = await authenticator(headers);
                // if the value was truthy, authentication succeeded
                if (authentication) return authentication;
            } catch (err) {
                this.emit('authentication-error', err);
            }
        }

        // return falsy value if all authenticators failed
        return null;
    } // AgentAmec#authenticate

} // AgentAmec

module.exports = AgentAmec;
