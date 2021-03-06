var passport = require('passport');
var TwitterStrategy = require('passport-twitter').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var db = require('../middleware/user');


var auth = function(app) {
    // when user wants to sign in using twitter
    //   - the user's browser posts /api/auth/twitter
    //   - user's browser redirects to twitter
    //   - twitter does it's sign-in/auth thing
    //   - twitter calls back /api/auth/twitter/callback with success or fail
    app.get('/api/auth/twitter',
	    tester,
	    passport.authenticate('twitter'),
            function(req, res) {
                // If this function gets called, auth was successful.
                // req.user contains authenticated user
            });

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

    // after user logs in via twitter, this route receives the callback
    app.get('/api/auth/twitter/callback',
            toaster,
	    passport.authenticate('twitter'),
	    taster,
	    function(req, res) {
		// if this func gets called, auth was successful.
		// req.user contains the authenticated user.

                res.redirect('/user/' + req.user);
            });

    app.get("/secret", function(req, res) {
	//    res.send(nconf.get('secret') + ' <a href="/logout">log</a>');
    });


    // route to test if user is logged in or not. testing only, @todo deleteme
    app.get('/api/auth/loggedin', function(req, res) {
        res.send(req.isAuthenticated() ? req.user : '0');
    });

    // route to log out
    app.get('/api/auth/logout', function(req, res) {
	req.logOut();
	res.redirect('/');
    });

    passport.use(new TwitterStrategy({
        consumerKey: app.get('twitter_consumer_key'),
        consumerSecret: app.get('twitter_secret_key'),
        callbackURL: app.get('twitter_login_callback')
    },

    // when user successfully authenticates with twitter, do this:
    function(token, tokenSecret, profile, done) {

        // we're going to use the twitter user id (tuid)
        // to find our user id (uid)
        var tuid = profile.id;
        console.dir(tuid);
        db.findOrCreateTwitter(tuid, function(err, uid) {
            //if (err) { return done(err); }
            //else
            //
            // done is a passport.js 'verify callback.'
            // in a server exeption, set err to non-null value.
            // in an auth failure, err remains null, and use
            // final arg to pass additional details.
            // more info: http://passportjs.org/guide/configure/

            // @todo possibility for future: get user's twitter info that we need

            // get UID from TUID
            console.log('TUID: ' + tuid + ' => UID: ' + uid);
            done(null, uid);
        });
    }))

    

    /////////////////////
    // Facebook login
    /////////////////////
    app.get('/api/auth/facebook', passport.authenticate('facebook'));

    app.get('/api/auth/facebook/callback',
            passport.authenticate('facebook'), 
            function(req, res) {
                console.log('auth.js::app.get - req.user:' + req.user); 
                res.redirect('/user/' + req.user);
            });
           

    passport.use(new FacebookStrategy({
        clientID: app.get('facebook_app_id'),
        clientSecret: app.get('facebook_app_secret'),
        callbackURL: app.get('facebook_login_callback')
    },
    function(accessToken, refreshToken, profile, done) {

        // we're going to use the facebook user id (fuid)
        // to find our user id (uid)
        var fuid = profile.id;
        console.dir(fuid);
        db.findOrCreateFacebook(fuid, function(err, uid) {
            // done is a passport.js 'verify callback.'
            // in a server exeption, set err to non-null value.
            // in an auth failure, err remains null, and use
            // final arg to pass additional details.
            // more info: http://passportjs.org/guide/configure/

            // @todo possibility for future: get user's facebook info we need
            console.log('FUID: ' + fuid + ' => UID: ' + uid);
            done(null, uid);
        });
    }))
    
}



module.exports = auth;


