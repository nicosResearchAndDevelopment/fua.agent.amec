const
    bcrypt       = require('bcrypt'),
    saltRounds   = 12,
    hashPassword = (password) => new Promise((resolve, reject) => bcrypt.hash(password, saltRounds, (err, hash) => err ? reject(err) : resolve(hash))),
    passwords    = [
        'test-password',
        'testing'
    ];

Promise.all(passwords.map(hashPassword)).then((hashes) => {
    const results = passwords.map((password, index) => ({
        'Password':    password,
        'BCrypt Hash': hashes[index]
    }));
    console.table(results);
}).catch(console.error);
