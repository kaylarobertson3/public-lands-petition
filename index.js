// require everything
const express = require('express');
const app = express();
const hb = require('express-handlebars');
const bodyParser = require('body-parser');
const dbModules = require('./db');
const auth = require('./auth.js');
// var csrf = require('csurf');
// app.use(csrf({ cookie: true }));


// // Sessions (switching from cookie session)
// var session = require('express-session');
// var Store = require('connect-redis')(session);
//
// app.use(session({
//     store: new Store({
//         ttl: 3600,
//         host: 'localhost',
//         port: 6379
//     }),
//     resave: false,
//     saveUninitialized: true,
//     secret: 'my super fun secret'
// }));

//cookie Session
var cookieSession = require('cookie-session');
app.use(cookieSession({
    secret: 'secret',
    maxAge: 24 * 60 * 60 * 1000
}));


//tell express to use handlebars
app.engine('handlebars', hb());
app.set('view engine', 'handlebars');

//set static/public folder
app.use('/public', express.static(__dirname + '/public'));

//Body parser lets you use req.body. nice.
app.use(bodyParser.urlencoded({
    extended: false
}));


// FUNCTIONS =================================

// check if logged in
function loginCheck(req, res, next) {
    if (!req.session.user) {
        res.redirect('/');
    } else {
        next();
    }
}

// ROUTES =================================

//home page ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
app.get('/', (req, res) => {
    if (req.session.user) {
        res.render('home', {
            layout: 'layout',
            aboutScroll: true,
            showLogout: true
        });
    } else {
        res.render('home', {
            layout: 'layout',
            showLogin: true,
            aboutScroll: true,

        });
    }

});

// register page~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
app.get('/register', (req, res) => {
    if (req.session.user) {
        res.redirect('/signPetition');
    } else {
        res.render('register', {
            layout: 'layout',
            showLogin: true
        });
    }
});


// new registration ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
app.post('/newReg', (req, res) => {
    if (!req.body.first || !req.body.last || !req.body.email || !req.body.password) {
        res.render('register', {
            layout: 'layout',
            error: true
        });

    } else {
        auth.hashPassword(req.body.password).then((hashed) => {
            dbModules.newReg(req.body.first, req.body.last, req.body.email, hashed).then((id) => {
                // setting user cookies on registration
                req.session.user = {
                    first: req.body.first,
                    last: req.body.last,
                    userId: id,
                    email: req.body.email
                };
                console.log("cookies set on newReg: ", req.session.user);
                console.log("hashed password: ", hashed);
                res.redirect('/more-info');
            });
        }).catch((err) => {
            console.log("error in newReg: ", err);
            res.render('register', {
                layout: 'layout',
                errorWrong: true
            });

        });
    }
});

// login page~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
app.get('/login', (req, res) => {
    if (req.session.user) {
        res.redirect('/features');
    } else {
        res.render('login', {
            layout: 'layout',
        });
    }
});


// login submit ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
app.post('/loginUser', (req, res) => {
    if (!req.body.email || !req.body.password) {
        res.render('login', {
            layout: 'layout',
            error: true
        });
    } else {
        console.log("in LoginUser");
        //compare against email to  check get password
        dbModules.getUserInfo(req.body.email).then((results) => {
            console.log("in GetuserInfo", results);
            return auth.checkPassword(req.body.password, results.hashed_pass)
                //if password is right, add all info to session
                .then((match) => {
                    if (match) {
                        // set cookies for logging in here
                        req.session.user = {
                            first: results.first,
                            last: results.last,
                            email: results.email,
                            userId: results.user_id,
                            sigId: results.signature_id
                        };
                        res.redirect('/signPetition');
                    } else {
                        res.render('more-info', {
                            layout: 'layout',
                            errorWrong: true
                        });
                        console.log(req.session.user);
                    }
                });
        }).catch((err) => {
            console.log("error: ", err);
            res.render('login', {
                layout: 'layout',
                errorWrong: true
            });
        });
    }
});

// edit profiles page ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
app.get('/more-info', loginCheck, (req, res, next) => {
    res.render('more-info', {
        layout: 'layout',
        title: 'Tell us about yourself',
        showLogout: true

    });
    req.session.user_profile = {
        age: req.body.age,
        city: req.body.city,
        website: req.body.website,
    };
});

app.post('/submitInfo', (req, res) => {
    dbModules.submitOptionalInfo(req.body.age, req.body.city, req.body.website, req.session.user.userId)
        .then(() => {
            res.redirect('/signPetition');
        });
});

// after login page??? will delete ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
app.get('/features', loginCheck, function(req, res) {
    res.render('features', {
        layout: 'layout',
        showLogout: true

    });
});


// sign route ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
app.get('/signPetition', (req, res) => {
    if (req.session.user.sigId) {
        res.redirect('/thankyou');
    } else {
        res.redirect('/sign');
    }
});

// sign page ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
app.get('/sign', (req, res) => {
    if (!req.session.user) {
        res.redirect('/login');
    } else if (req.session.user.sigId) {
        res.redirect('/thankyou');
    } else {
        res.render('sign', {
            layout: 'layout',
            first: req.session.user.first,
            last: req.session.user.last,
            aboutLink: true,
            showLogout: true

        });
    }
});

// submitSig ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
app.post('/submitSig', (req, res) => {
    if (!req.body.signature) {
        res.render('sign', {
            layout: 'layout',
            error: true,
            first: req.session.user.first,
            last: req.session.user.last,
            aboutLink: true
            // csrfToken: req.csrfToken()
        });
    } else {
        console.log(req.session.user);
        dbModules.newSig(req.body.signature, req.session.user.userId).then(function(results) {
            console.log('results from newSig ', results);
            req.session.user.sigId = results.id;
            res.redirect('/signPetition');
        }).catch(function(err) {
            console.log("submitSig error: ", err);
        });
    }
});

// thank you page ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
app.get('/thankyou', (req, res) => {
    dbModules.getSig(req.session.user.sigId).then(function(signature) {
        res.render('thankyou', {
            layout: 'layout',
            first: req.session.user.first,
            last: req.session.user.last,
            sig: signature,
            showLogout: true
        });
        // console.log(req.session);
    }).catch((err) => {
        console.log("thank you err:", err);
    });
});


// signers page ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
app.get('/signers', loginCheck, (req, res) => {
    dbModules.allSigs().then((result) => {
        console.log(result);
        res.render('signers', {
            layout: 'layout',
            title: 'signers',
            signers: result,
            showLogout: true

            // first: results.first
        });
    });
});



// cities page ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
app.get('/signers/:city', loginCheck, (req, res) => {
    dbModules.getSigsByCity(req.params.city).then(function(results){
        console.log(results);
        res.render('signers', {
            layout: 'layout',
            title: 'signers',
            signers: results.rows,
            city: req.params.city,
            showCity: true,
            showLogout: true

        });
    });
});

// delete signature ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
app.post('/deleteSignature', (req, res) => {
    console.log(req.session);
    dbModules.deleteSignature(req.session.user.userId)
        .then(() => {
            delete req.session.user.sigId;
            res.redirect('/');
        });
});


// update info page ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
app.get('/settings', loginCheck, (req, res) => {
    console.log(req.session.email);
    dbModules.getUserInfo(req.session.user.email)
        .then((results) => {
            res.render('settings', {
                layout: 'layout',
                title: 'Edit Profile',
                first: req.session.user.first,
                last: req.session.user.last,
                email: results.email,
                age: results.age,
                city: results.city,
                website: results.website,
                showLogout: true

            });
        });
});

app.post('/updateInfo', (req, res) => {
    Promise.all([
        dbModules.updateOriginalInfo(req.body.first, req.body.last, req.body.email, req.body.password, req.session.user.user_id),
        dbModules.updateOptionalInfo(req.body.age, req.body.city, req.body.website, req.session.user.user_id)
    ])
        .then(() => {
            res.redirect('/thankyou');
        });
});


//logout ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
app.get('/logout', (req, res) => {
    // req.session.destroy();
    req.session = null;
    res.redirect('/');
});

// csrf error handler
app.use(function (err, req, res, next) {
    if (err.code !== 'EBADCSRFTOKEN') return next(err);
    // handle CSRF token errors here
    res.status(403);
    res.send('form tampered with');
});

app.get('*', (req, res) => {
    res.statusCode = 404;
    res.render('404', {
        layout: 'layout'
    });
});

//start express server
app.listen(process.env.PORT || 8080, function() {
    console.log("listening");
});
