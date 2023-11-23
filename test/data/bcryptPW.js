require('bcrypt').hash('test-password', 12, (err, hash) => {
    console.log(err || hash);
});
