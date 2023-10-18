const
    Amec               = exports,
    {name: identifier} = require('../package.json'),
    assert             = require('@nrd/fua.core.assert');

assert(!global[identifier], 'unable to load a second uncached version of the singleton ' + identifier);
Object.defineProperty(global, identifier, {value: Amec, configurable: false, writable: false, enumerable: false});

const
    _Amec        = Object.create(null),
    EventEmitter = require('events'),
    is           = require('@nrd/fua.core.is');

_Amec.authenticators = new Map();
_Amec.emitter        = new EventEmitter();

/**
 * @param {string} mechanism
 * @param {function(headers: {[key: string]: string}): any | Promise<any>} authenticator
 * @returns {this}
 */
Amec.registerMechanism = function (mechanism, authenticator) {
    assert.string(mechanism);
    assert.function(authenticator);
    assert(!_Amec.authenticators.has(mechanism), '"' + mechanism + '" already registered');
    _Amec.authenticators.set(mechanism, authenticator);
    return Amec;
};

/**
 * @param {{[key: string]: string}} headers
 * @param {...(string|Array<string>)} mechanisms
 * @returns {Promise<any|null>} authentication
 */
Amec.authenticate = async function (headers, ...mechanisms) {
    // validate headers and string values
    assert.object(headers);
    const fields = Object.entries(headers);
    assert.array(fields, ([key, value]) => is.string(value), 1);
    // make a new independent frozen header object with lower case keys
    headers = Object.freeze(Object.fromEntries(fields.map(([key, value]) => [key.toLowerCase(), value])));

    if (mechanisms.length > 0) {
        // if mechanisms are requested, check their existence
        mechanisms = mechanisms.flat(1);
        assert.array(mechanisms, mechanism => _Amec.authenticators.has(mechanism), 1);
    } else {
        // else validate if any mechanisms are registered
        assert(_Amec.authenticators.size > 0, 'no registered auth mechanisms');
        mechanisms = Array.from(_Amec.authenticators.keys());
    }

    for (let mechanism of mechanisms) {
        try {
            // try for each requested mechanism to authenticate
            const
                authenticator  = _Amec.authenticators.get(mechanism),
                authentication = await authenticator(headers);
            // if the value was truthy, authentication succeeded
            if (authentication) return authentication;
        } catch (err) {
            _Amec.emitter.emit('authentication-error', err);
        }
    }

    // return falsy value if all authenticators failed
    return null;
};

Amec.on   = _Amec.emitter.on.bind(_Amec.emitter);
Amec.once = _Amec.emitter.once.bind(_Amec.emitter);
Amec.off  = _Amec.emitter.off.bind(_Amec.emitter);

Object.freeze(Amec);
module.exports = Amec;
