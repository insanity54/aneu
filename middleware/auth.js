var passport = require('passport');
var user = require('./user');

console.log('MIDDLEWARE AUTH HAS BEEN CALLED !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');

function serialize(req, res, next) {
    // Serialize user object to the session
    // this is called on every authenticated request
    // and stores the identifying information in the sesion data
    passport.serializeUser(function(usr, done) {
	console.log('ima serializeing 4 real');
	done(null, usr.id);
    });
}

function deserialize(req, res, next) {
    // pull the cookie from the user's browser
    // using the cookie, find who it is that is visiting
    // pull that user's info from the db
    passport.deserializeUser(function(id, done) {
	console.log('ima 4real deserializin and the user id is ' + id );
        
	user.getTwitter(id, function (err, user) {
            if (err) throw err;
            if (!user) {
                 done(null, null)
            };
            done(null, user);
        });
    });
}

module.exports = {
    serialize: serialize,
    deserialize: deserialize
}
