
var redis = require('redis');
var client = redis.createClient();
client.select(8, function(inf) { console.log(inf) }); //@todo this needs to come from config







// REDIS reference
//
//
// Create a user
//   Increment user ID (UID)
//     INCR users/uids
//
//   Add UID to set containing all UIDs
//     SADD users/all 1         // add user ID to set of all user IDs
//
//   Set user data
//     SET users/1/first_name Pete
//     SET users/1/last_name Rogers
//     SET users/1/username petey54
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
//
// Show all UIDs
//   SMEMBERS users/all       // show all user IDs
//
//
// Get UID using username
//   
//   users/x/username insanity54
//
//
// Get UID using twitter ID
//
// Get UID using facebook ID
// 
// Get UID using Google ID



exports.getUid = function(requesteduser, callback) {
    

    client.
}


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



