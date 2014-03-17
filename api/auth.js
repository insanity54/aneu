var passport = require('passport');
var TwitterStrategy = require('passport-twitter').Strategy;
var user = require('../component/user');


var auth = function(app) {


    // when user wants to sign in using twitter
    //   - the user's browser posts /api/auth/twitter
    //   - user's browser redirects to twitter
    //   - twitter does it's sign-in/auth thing
    //   - twitter calls back /api/auth/twitter/callback with success or fail
    app.get('/api/auth/twitter',
	    tester,
	    passport.authenticate('twitter'));

    function tester(req, res, next) {
        console.log('tester has run, we had a test');
        console.log('ye shall nut pass');
        next();
    };

    function toaster(req, res, next) {
        console.log('callback has run, lets have a toast');
        next();
    };

    function taster(req, res, next) {
        console.log('we are authenticated, lets have a taste');
        next();
    };
 
    app.get('/api/auth/twitter/callback',
            toaster,
	    passport.authenticate('twitter'),
	    taster,
	    function(req, res) {
		// if this func gets called, auth was successful.
		// req.user contains the authenticated user.

                console.dir(req.user);
		res.send(['welcome, ' + req.user._json.name,
                          '<img src="' + req.user._json.profile_image_url + '"/>',
                         ].join("<br>"));
	    });

    app.get("/secret", function(req, res) {
	//    res.send(nconf.get('secret') + ' <a href="/logout">log</a>');
    });


    // route to test if user is logged in or not. testing only, @todo deleteme
    app.get('/api/auth/loggedin', function(req, res) {
        res.send(req.isAuthenticated() ? req.user : '0');
    });

    // route to log in
    // app.post('/api/auth/login', middleware.passport.authenticate('local'), function(req, res) {
    //     res.send(req.user);
    // });

    // route to log out
    app.post('/api/auth/logout', function(req, res) {
	req.logOut();
	res.send(200);
    });

    passport.use(new TwitterStrategy({
        consumerKey: app.get('twitter_consumer_key'),
        consumerSecret: app.get('twitter_secret_key'),
        callbackURL: "http://dwane.co:8080/api/auth/twitter/callback"
    },

    // when user successfully authenticates with twitter, do this:
        function(token, tokenSecret, profile, done) {
            user.get_twitter(profile.id, function(err, found) {
                // @todo this function can be abstracted a bit better in the user module

                if (!found) {
                    user.create(profile, function(err, user) {
                        if (err) throw err;
		    });
                }

                // successfully found or created user
                done(null, profile);

                // done is a passport.js 'verify callback.'
                // in a server exeption, set err to non-null value.
                // in an auth failure, err remains null, and use final arg to pass additional details.
                // more info: http://passportjs.org/guide/configure/
                // error finding or creating user
            });
	}))
};

module.exports = auth;


