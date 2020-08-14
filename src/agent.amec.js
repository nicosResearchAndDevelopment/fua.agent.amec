module.exports = ({
                      'hrt':             hrt = () => (new Date()).valueOf() / 1000,
                      'auth_modules':    auth_modules = [],
                      'default_timeout': default_timeout = 3000
                  }) => {

    auth_modules = ((Array.isArray(auth_modules)) ? auth_modules : [auth_modules]);

    const
        sessions    = new Map()
    ;
    let
        i           = 0,
        single_mech = undefined,
        _mech       = {}
    ; // let

    //region fn

    function toSession(auth) {
        let
            key  = `urn:auth:${auth['mech']}:${auth['identity']['@id']}`,
            node = sessions.get(key)
        ;
        if (node) {
            node['auth']['requestedAt'] = ((new Date).valueOf() / 1000);
            node['bestbefore']          = (node['auth']['requestedAt'] + /** seconds */ 300);
        } else {
            node = {
                'auth':       auth,
                // REM: something like time:Instant (here: numericTimePosition)
                'bestbefore': (((new Date).valueOf() / 1000) + /** seconds */ 300)
            };
            sessions.set(key, node);
        } // if ()
        return node['auth'];
    } // function toSession()

    //endregion fn

    function agent_amec(request, mech = undefined, timeout = default_timeout) {

        mech = mech || single_mech;

        return new Promise((resolve, reject) => {
            let semaphore;
            try {

                semaphore = setTimeout(() => {
                    clearTimeout(semaphore);
                    reject(`agent_amec : timeout <${timeout}> reached.`);
                }, timeout);

                if (mech) {
                    _mech[mech](request).then((auth) => {
                        clearTimeout(semaphore);
                        resolve(toSession(auth));
                    }).catch((err) => {
                        clearTimeout(semaphore);
                        reject(err);
                    }); // _mech[mech]()
                } else {
                    Promise.race(auth_modules.map((am) => am(request, auth_from_session))).then((auth) => {
                        clearTimeout(semaphore);
                        toSession(auth);
                        resolve(auth);
                    }).catch((err) => {
                        clearTimeout(semaphore);
                        reject(err);
                    }); // Promise.race()
                } // if ()

            } catch (jex) {
                clearTimeout(semaphore);
                reject(jex);
            } // try
        }); /// return new P
    } // function agent_amec()

    auth_modules.forEach((am) => {
        single_mech        = am['mech'];
        _mech[single_mech] = am;
        Object.defineProperty(agent_amec, single_mech, {value: am});
        i++;
    });
    Object.seal(_mech);
    if (i !== 1)
        single_mech = undefined;

    return agent_amec;

};