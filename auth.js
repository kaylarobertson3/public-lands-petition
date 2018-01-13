const bcrypt = require('bcryptjs');



//check password for login
exports.checkPassword = function(plainTextPassword, storedHash) {
    return new Promise((resolve, reject) => {
        bcrypt.compare(plainTextPassword, storedHash, (err, match) => {
            if (err) {
                reject(err);
            } else {
                resolve(match);
            }
        });
    });
};


// new registration, hashing Password
exports.hashPassword = function(plainTextPassword) {
    return new Promise((resolve, reject) => {
        bcrypt.genSalt((err, salt) => {
            if (err) {
                console.log(err);
            }
            bcrypt.hash(plainTextPassword, salt, (err, hash) => {
                if (err) {
                    return reject(err);
                }
                resolve(hash);
            });
        });
    });
};
