
var redis = require('redis');
var client = redis.createClient();
client.select(8, function(inf) { console.log(inf) }); //@todo this needs to come from config





//
// REDIS reference (use singular 'user' not plural 'users' plz)
//
////////////////////////////////////////
////////////////////////////////////////
//
// users (n = UID)
//
// (key) user/n/info1
// (key) user/n/acct    // account type (twitter, facebook, or google)
// (key) user/n/info3
// (key) user/n/inv/weapon
// (key) user/n/inv/helm
// (key) user/n/inv/armor
// (key) user/n/inv/boots
// (key) user/n/stats/level
//
//
//
// admins. UIDs in this set are allowed admin access
// 
// (set) admin/all
// 
////////////////////////////////////////
////////////////////////////////////////
//
// Create a user
//   Increment user ID (UID)
//     INCR user/uids
//
//   Add UID to set containing all UIDs
//     SADD user/all 1         // add user ID to set of all user IDs
//
//   Set the user account type
//     SET user/1/acct
//
//   Set user data
//     SET user/1/first_name Pete
//     SET user/1/last_name Rogers
//     SET user/1/username petey54
//     SET user/1/champion/weapon sword
//     SET user/1/champion/armor chainmail
//
//
// Look up a user
//   KEYS user/x/*             // (inject user's ID at x)
//   1) user/x/first_name
//   2) user/x/last_name
//   3) user/x/username
//
//   GET user/x/first_name
//   "Pete"
//   GET user/x/last_name
//   "Rogers"
//   GET user/x/username
//   "petey54"
//
//
// Show all user IDs
//   SMEMBERS user/all 
//
//
// Add user 1 to admin group
//   SADD admin/all 1
//
// Add user 1 to twitter account
//   user
//   
//
// Show all admin IDs
//   SMEMBERS admin/all
//
//
// Get UID using twitter ID
//   user/twitter/27835703/uid => 1
//
// Get UID using facebook ID n
//   user/facebook/n/uid
// 
// Get UID using Google ID n
//   user/google/n/uid
//


/**
 * isAdmin
 *
 * Returns true if specified UID is in the admin group
 *
 * @param int uid       the user id number
 * @callback            called when result is found ({bool} err, {bool} member)
 */
var isAdmin = function(uid, callback) {
    client.SISMEMBER('admin/all', uid, function(err, member) {
        if (err) callback(true, null);
        callback(null, member);
    });
}



/**
 * getUserType
 *
 * Queries the database to find the user account type.
 * User account type can be one of the following:
 *   - facebook
 *   - twitter
 *   - google
 *
 * @param int uid       User's ID number
 * @callback callback   called when user's account type is found.
 *                      (bool err, String type)
 */
var getUserType = function(uid, callback) {
    client.GET('user/' + uid + '/acct', function(err, type) {
        if (err) callback(true, null);
        callback(null, type);
    });
}


/**
 * createTwitter
 *
 * Creates a LARP user account with a twitter log-in.
 * This func is called by findOrCreateTwitter()
 *
 * @param int tuid      The twitter user id number
 * @callback callback   called when user is created ({bool} err, {int} uid)
 */
var createTwitter = function(tuid, callback) {
    // Get UID using twitter ID
    //   user/twitter/27835703/uid => 1

    // generate a new UID
    // associate UID with TUID
    // return UID

    // Create a user
    //   Increment user ID (UID)
    //     INCR user/uids
    //
    //   Add UID to set containing all UIDs
    //     SADD user/all 1         // add user ID to set of all user IDs
    //
    //   Set user data
    //     SET user/1/first_name Pete
    //     SET user/1/last_name Rogers
    //     SET user/1/username petey54

    // generate a new UID
    client.INCR('user/uids', function(err, uid) {

        console.log(' >> CREATING: ' + uid);
        // add uid to set containing all UIDs
        client.SADD('user/all', uid);

        // set the user account type to twitter
        client.SET('user/' + uid + '/acct', 'twitter');

        // associate UID with TUID
        client.SET('user/twitter/' + tuid + '/uid', uid);

        callback(null, uid);
    });
}


var testCall = function(callback) {
    client.INCR('user/uids', function(err, uid) {
        console.log('testCall: ' + uid);
        callback(null, uid);
    });
}



/**
 * findOrCreateTwitter
 * 
 * Finds the username in the redis db based on the twitter user id number
 * that the user is logging in with
 *
 * @param int tuid      The twitter user id number
 * @callback callback   called when twitter user found. (err, uid)
 */
var findOrCreateTwitter = function(tuid, callback) {

    // if there is a reply to GET user/twitter/<tuid>/uid
    //   get twitter user
    // else
    //   create twitter user

    client.GET('user/twitter/' + tuid + '/uid', function(err, uid) {
        if (err) callback(err, null);
        if (uid) {
            console.log('there is a twitter user so getting ' + uid);
            callback(null, uid);

        } else {
            console.log('there is not a twitter user so creating she');
            createTwitter(tuid, function(err, uid) {
                if (err) callback(err, null);
                console.log('create twitter gave me: ' + uid);
                callback(null, 1);
            });
        }
    });
}

/**
 * getUser
 * 
 * Gets all user keys from the redis db
 *
 * So that's like user's username, name, gold in their bank,
 * items in their inventory, etc.
 *
 * @param int requesteduser    user id number (UID)
 * @callback callback          called back with (err, userstats)
 */
var getUser = function(requesteduser, callback) {

    var userstats = {};
    console.log('user::getUser requested user: ' + requesteduser);
    console.dir(requesteduser);
    
    client.KEYS('user/' + requesteduser + '/*', function(err, replies) {
        if (err) throw err;
        if (replies != "") {
            console.log('replies:::: ' + replies);

            // client.MGET is something that could replace the forEach.

            replies.forEach(function (reply, i) {
                client.GET(reply, function(err, value) {
                    console.log('reply:::: \'' + reply + '\'');
                    // get the key name so we can populate a js object
                    var n = reply.lastIndexOf('/');
                    var key = reply.substring(n + 1, reply.length);
                    userstats[key] = value;

                    //                console.log('here:');
                    //                console.dir(userstats);
                    if (i == replies.length-1) {
                        callback(null, userstats);
                    }
                });
            });
        } else {
            console.log('user thingy is empty');
            callback(true, null);
        }
    });
}


module.exports = {
    createTwitter: createTwitter,
    findOrCreateTwitter: findOrCreateTwitter,
    getUser: getUser,
    getUserType: getUserType,
    isAdmin: isAdmin
}