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
        util.assert(util.isObject(headers), 'AgentAmec#authenticate : expected headers to be an object', TypeError);
        const fields = Object.entries(headers);
        util.assert(fields.length > 0 && fields.every(([key, value]) => util.isString(value)),
            'AgentAmec#authenticate : the headers must not be empty and contain only string values');
        headers = Object.freeze(Object.fromEntries(fields.map(([key, value]) => [key.toLowerCase(), value])));

        if (mechanisms.length > 0) {
            mechanisms = mechanisms.flat(1);
            util.assert(mechanisms.length > 0, 'AgentAmec#authenticate : expected auth mechanisms to not be empty');
            util.assert(mechanisms.every(mechanism => this.#authenticators.has(mechanism)),
                'AgentAmec#authenticate : expected only registered auth mechanisms');
        } else {
            util.assert(this.#authenticators.size > 0, 'AgentAmec#authenticate : expected any auth mechanisms to be registered');
            mechanisms = Array.from(this.#authenticators.keys());
        }

        for (let mechanism of mechanisms) {
            try {
                const
                    authenticator  = this.#authenticators.get(mechanism),
                    authentication = await authenticator(headers);
                if (authentication) return authentication;
            } catch (err) {
                this.emit('authentication-error', err);
            }
        }

        return null;
    } // AgentAmec#authenticate

} // AgentAmec

module.exports = AgentAmec;
