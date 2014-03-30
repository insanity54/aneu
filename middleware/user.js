
var redis = require('redis');
var client = redis.createClient();
client.select(8, function(inf) { console.log(inf) }); //@todo this needs to come from config






// REDIS reference
//
//
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
//
//
// Look up a user
//   KEYS users/x/*             // (inject user's ID at x)
//   1) user/x/first_name
//   2) user/x/last_name
//   3) user/x/username
//
//   GET users/x/first_name
//   "Pete"
//   GET users/x/last_name
//   "Rogers"
//   GET users/x/username
//   "petey54"
//
//
// Show all UIDs
//   SMEMBERS user/all       // show all user IDs
//
//
// Get UID using username
//   
//   user/x/username insanity54
//
//
// Get UID using twitter ID
//   twitter/27835703 => 1
//
// Get UID using facebook ID
// 
// Get UID using Google ID


    // REDIS reference
    //

    //
    // 
    // Create a user
    //   Increment user ID
    //     INCR users/uids => (integer) 1
    //   Create user keys using new user ID
    //     SET users/1/first_name Pete
    //     SET users/1/last_name Rogers
    //     SET users/1/username petey54
    //     SET users/1/weapon sword
    //     SET users/1/race elf
    //     SET users/1/potion mana
    //     SADD users/all 1         // add user ID to set of all user IDs
    //
    //
    // Show all user IDs
    //   SMEMBERS users/all 
    //
    //
    // Add user 1 to admin group
    //   SADD admins/all 1
    //
    //
    // Show all admin IDs
    //   SMEMBERS admins/all
    //
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







/**
 * findOrCreateTwitter
 * 
 * Finds the username in the redis db based on the twitter user id number
 * that the user is logging in with
 *
 * @param int tuid      The twitter user id number
 * @callback callback   called when twitter user found. (err, uid)
 */
exports.findOrCreateTwitter = function(tuid, callback) {

    callback(null, 1);

                // if (uid != null) {
                //     // we found an existing uid that matches the tuid

                // } else {
                //     // we didn't find a match
                //     user.createTwitter

                // }
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
exports.getUser = function(requesteduser, callback) {

    var userstats = {};

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