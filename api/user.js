/*
 *
 * User API
 *
 * Handles GETs, POSTs, DELETEs, to URLs such as /user/insantiy54
 *
 */ 


var redis = require('redis');
var client = redis.createClient();

var db = require('../middleware/user.js');




var user = function(app) {

    var dbinst = app.get('redisserver');
    client.select(dbinst, function(inf) { console.log(inf) });  // switch to redis database instance specified in config.json (default is 0)

    app.get('/user/:username', function(req, res) {

        var requser = req.params.username
        var userinfo = {};

        // get username from URL (^requser)
        // from username get UID (db.getUid)
        // use UID to get user object (db.getUser)

        // work with redis to get user object
        db.getUser(requser, function (err, user) {
            if (err) {
                console.log('error interacting wit redis');
                res.send('no such user');
            } else {
                console.log('no errs interacting with redis');
                console.dir(user);
                res.json(user);
            }
        });
    });       

    function tester(req, res, next) {
        console.log('tester has run, we had a test');
        console.log('ye shall nut pass');
        next();
    };
        
    // REDIS reference
    //
    // Increment user ID
    //   INCR users/uids
    //
    // Create a user
    //   SET users/1/first_name Pete
    //   SET users/1/last_name Rogers
    //   SET users/1/username petey54
    //
    //   SADD users/all 1         // add user ID to set of all user IDs
    //   SMEMBERS users/all       // show all user IDs
    //
    // Look up a user
    //   KEYS users/x/*             // (inject user's ID at x)
    //   1) users/x/first_name
    //   2) users/x/last_name
    //   3) users/x/username
    //
    //   GET users/x/first_name
    //   "Pete"
    //   GET users/x/last_name
    //   "Rogers"
    //   GET users/x/username
    //   "petey54"
    //



}                

module.exports = user;
