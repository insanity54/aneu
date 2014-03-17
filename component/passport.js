var passport = require('passport');
var user = require('./user.js');

// passport setup
passport.serializeUser(function(usr, done) {
    console.log('ima serializeing');
    done(null, usr.id);
});

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
