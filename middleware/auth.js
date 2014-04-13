var passport = require('passport');
var db = require('./user');

console.log('MIDDLEWARE AUTH HAS BEEN CALLED !!!');


// Serialize user object to the session
// this is called on every authenticated request
// and stores the identifying information in the sesion data
passport.serializeUser(function(profile, done) {
    console.log('ima serializeing 4 real');
    console.dir(profile);
    done(null, profile);
});


// pull the cookie from the user's browser
// using the cookie, find who it is that is visiting
// pull that user's info from the db
passport.deserializeUser(function(profile, done) {
    console.log('ima 4real deserializin and the user id is ' + profile );
    
    done(null, profile);
//    db.getChampion(uid, function (err, user) {
//        if (err) throw err;
//        if (!user) {
//            done(null, null)
//        };
//        done(null, user);
//    });
});


// module.exports = {
//     serialize: serialize,
//     deserialize: deserialize
// }
