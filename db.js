const spicedPg = require('spiced-pg');
var db = process.env.DATABASE_URL || spicedPg('postgres:postgres:postgres@localhost:5432/signatures');

// var db = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/signatures';

// SIGNATURES QUERIES ===================================

//save new signature
exports.newSig = function(signature, user_id) {
    const params = [signature, user_id];
    const q = `INSERT INTO signatures (signature, user_id) VALUES ($1, $2) RETURNING id;`;
    return db.query(q, params).then(function(results) {
        return results.rows[0];
    });
};

// save new registration
exports.newReg = function(first, last, email, password) {
    const params = [first, last, email, password];
    const q = `INSERT INTO users (first, last, email, hashed_pass) VALUES ($1, $2, $3, $4) RETURNING id;`;
    return db.query(q, params).then(function(results) {
        return results.rows[0].id;
    });
};

// retreive signature image to display
exports.getSig = function(id) {
    const q = `SELECT signature FROM signatures WHERE id=$1;`;
    const params = [id];
    return db.query(q, params).then(function(results) {
        return results.rows[0].signature;
    });
};

// USERS + SIGNATURE queries ============================

// retreive names of all signers
exports.allSigs = function() {
    const q =
        `SELECT users.first, users.last, user_profiles.age, user_profiles.city, user_profiles.website
        FROM signatures
        LEFT JOIN users
            ON users.id = signatures.user_id
        LEFT JOIN user_profiles
            ON signatures.user_id = user_profiles.user_id`;
    const params = [];

    return db.query(q, params)
        .then((results) => {
            console.log("results of allSIgs ", results.rows);
            return results.rows;
        })
        .catch((err) => {
            console.log("Error in allsigs ", err);
        });
};

exports.getSigsByCity = function(city) {
    const q = `SELECT users.first, users.last, user_profiles.website, user_profiles.age
    FROM signatures
    LEFT JOIN users
    ON users.id = signatures.user_id
    LEFT JOIN user_profiles
    ON user_profiles.user_id = signatures.user_id
    WHERE user_profiles.city =  $1;`;

    const params = [city];
    return db.query(q, params);
};

exports.getUserInfo = function(email) {
    console.log("running getUSerInfo: ", email);
    return db.query(`SELECT users.id AS user_id, users.first, users.last, users.email, users.hashed_pass, signatures.signature, signatures.id AS signature_id
     FROM users
     LEFT JOIN signatures
     ON users.id = signatures.user_id
     WHERE email = $1`,[email]).then((results) => {
        console.log("results from getUserInfo: ", results.rows);
        return results.rows[0];
    }).catch(function(err) {
        console.log("error in getUserInfo", err);
        throw err;
    });
};

exports.getSettings = function(userId) {
    console.log("running getSettings: ");
    return db.query(`SELECT age, city FROM user_profiles
     WHERE user_id = $1`,[userId]).then((results) => {
        console.log("results from getSettings: ", results.rows);
        return results.rows[0];
    }).catch(function(err) {
        console.log("error in getUserInfo", err);
        throw err;
    });
};

exports.deleteSignature = function(id) {
    return db.query(`DELETE FROM signatures
                     WHERE user_id = $1`, [id])
        .then((results) => {
            console.log(results);
        })
        .catch((err) => console.log("deleteSig error: ", err));
};

// USER PROFILE queries =

exports.updateOriginalInfo = function(first, last, email, userId) {
    console.log("updating OG info with ", first, last, email);
    const params = [first, last, email, userId];
    const q = `
            UPDATE users
            SET first = $1, last = $2, email = $3
            WHERE id = $4`;
    return db.query(q,params).catch((err) => {
        console.log("updateOriginalInfo error", err);
    });
};

//updating optional info
exports.updateOptionalInfo = function(age, city, website, userId){
    console.log("Updating optional info with", age, city, userId);
    const params = [age, city, website, userId];
    const q = `
            UPDATE user_profiles
            SET age = $1, city = $2, website = $3
            WHERE user_id = $4`;
    return db.query(q,params).catch((err) => {
        console.log("updateOptionalInfo error ", err);
    });
};


//submitting optional info
exports.submitOptionalInfo = function(age, city, website, userId){
    console.log("inserting this into user profiles:", age, city, website);
    const q = `INSERT INTO user_profiles (age, city, website, user_id) VALUES ($1, $2, $3, $4);`;
    const params = [age, city, website, userId];
    return db.query(q, params).catch((err) => {
        console.log("err in submitInfo post ", err);
    });
};

// SELECT users.first, users.last, user_profiles.age, user_profiles.city, user_profiles.website
// FROM users
// JOIN user_profiles
//     ON users.id = user_profiles.user_id;
