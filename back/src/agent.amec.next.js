const
    util        = require('@nrd/fua.core.util'),
    assert      = new util.Assert('agent.amec'),
    authModules = new Map();

// This is really bare bone and will change in the future when the API is better defined!

exports.authMechanism = function (mechanism, callback) {
    assert(util.isString(mechanism), 'addMechanism : expected mechanism to be a string', TypeError);
    assert(!authModules.has(mechanism), 'addMechanism : auth "' + mechanism + '" exists already');
    //if (!callback) return authModules.get(mechanism);
    assert(util.isFunction(callback), 'addMechanism : expected callback to be a function', TypeError);

    authModules.set(mechanism, callback);
};

exports.authenticate = async function (request, mechanism, users) {
    assert(util.isString(mechanism), 'authenticate : expected mechanism to be a string', TypeError);
    assert(authModules.has(mechanism), 'authenticate : auth "' + mechanism + '" is not defined');
    //assert(util.isObject(request) && util.isString(request.url), 'authenticate : expected request to be a request object', TypeError);
    //assert(util.isObject(request.session), 'authenticate : expected request to have a session', TypeError);

    const
        callback = authModules.get(mechanism),
        auth     = await callback(request, users)
    ;

    //if (auth) await new Promise((resolve, reject) => {
    //    request.session.auth = auth;
    //    request.session.save(err => err ? reject(err) : resolve())
    //});

    return auth;
};