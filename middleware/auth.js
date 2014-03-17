var passport = require('passport');
var user = require('../component/user');

console.log('MIDDLEWARE AUTH HAS BEEN CALLED !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');

function serialize(req, res, next) {
    // Serialize user object to the session
    // this is called on every authenticated request
    // and stores the identifying information in the sesion data
    passport.serializeUser(function(usr, done) {
	console.log('ima serializeing');
	done(null, usr.id);
    });
}

function deserialize(req, res, next) {
    // pull the cookie from the user's browser
    // using the cookie, find who it is that is visiting
    // pull that user's info from the db
    passport.deserializeUser(function(id, done) {
	console.log('ima deserializin and the user id is ' + id );
        
	user.get_twitter(id, function (err, user) {
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
