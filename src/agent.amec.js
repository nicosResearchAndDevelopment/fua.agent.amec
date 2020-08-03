module.exports = ({
                      'hrt':             hrt = () => (new Date()).valueOf() / 1000,
                      'auth_modules':    auth_modules = [],
                      'default_timeout': default_timeout = 3000
                  }) => {

    auth_modules = ((Array.isArray(auth_modules)) ? auth_modules : [auth_modules]);

    let
        i           = 0,
        single_mech = undefined,
        _mech       = {}
    ; // let

    auth_modules.forEach((am) => {
        single_mech        = am['mech'];
        _mech[single_mech] = am;
        i++;
    });
    Object.seal(_mech);
    if (i !== 1)
        single_mech = undefined;

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
                        resolve(auth);
                    }).catch((err) => {
                        clearTimeout(semaphore);
                        reject(err);
                    }); // _mech[mech]()
                } else {
                    Promise.race(auth_modules.map((am) => am(request))).then((auth) => {
                        clearTimeout(semaphore);
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

    return agent_amec;

};