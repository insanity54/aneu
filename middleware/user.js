
var redis = require('redis');
var client = redis.createClient();
client.select(8, function(inf) { console.log(inf) }); //@todo this needs to come from config





//
// REDIS reference (use singular 'user' not plural 'users' plz)
//
////////////////////////////////////////
////////////////////////////////////////
//
// users (n = UID) (user ID)
//
// (key) user/n/info1
// (key) user/n/acct    // account type (twitter, facebook, or google)
// (key) user/n/info3
//
// champions (n = CID) (champion ID)
// (key) champion/n/inv/weapon
// (key) champion/n/inv/helm
// (key) champion/n/inv/armor
// (key) champion/n/inv/boots
// (key) champion/n/stats/level
//
// admins. UIDs in this set are allowed admin access
// 
// (set) admin/all
//
//
// Items
// (key) item/index  // an index for item ID numbers
// (sorted set) item/weapon
// (sorted set) item/potion
// (sorted set) item/tool
//
// items have:
//   - name
//   - description
//   - picture
//   - stats (@todo future)
//     - attack
//     - defense
//     - durability
//
// item/index             an index of all item ID numbers (iid)
// item/all               a set containing all IIDs.
// item/weapon            a set of item numbers belonging to the weapon group
// item/consumable        a set of iids belonging to the consumable group
//
// item/iid/name          (key) name of item
// item/iid/description   (key) description of item
// item/iid/picture       base64 encoded png/jpg/etc.
// 
// when retrieving list of all items
//   SMEMBERS item/all => [replies]
//   MGET [replies]
//
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
//     SET user/1/acct [twitter|facebook|google]
//
//   Create the user's first champion
//
//     Increment champion ID (CID)
//       INCR champ/uids
//
//     Set champion data
//       SET champion/n/weapon sword
//       SET champion/n/armor chainmail
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
//
// Create an item
//   incr item/index    // use the returned value for the new item number
//   zadd item/weapon
//


/**
 * asyncLoop
 *
 * A crazy insane inception function to run an event-driven asyncronous loop
 * by wilsonpage http://stackoverflow.com/users/516629/wilsonpage
 * http://stackoverflow.com/a/7654602
 *
 * @param {object} o       object containing...
 *                         {int} length   number of iterations to do
 *                         {func} functionToLoop  the function to loop
 *                         {callback} what to do once done looping
 */
var asyncLoop = function(o) {
    var i = -1;
    
    var loop = function() {
        i++;
        if (i == o.length) { o.callback(); return; }
        o.functionToLoop(loop, i);
        console.log(' ||| i:' + i + ' o.length:' + o.length + ' |||');
    }
    loop(); //init
}


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
        console.log('checking to see if user ' + uid + ' is an admin');
        console.dir(uid);
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
 * getAllChampions
 *
 * Gets an object containing objects for every champion in the LARP.
 *
 * @callback done          called back with (err, champs)
 */
var getAllChampions = function(done) {

    var champs = {};
    
    // get total number of champions in the LARP
    client.GET('champion/uids', function(err, total) {
        if (err) throw err;
        if (total == null) { console.log("ERROR: There are no champions"); }
        console.log('total is: ' + total);

        
        asyncLoop({
            length: total,
            
            functionToLoop: function(loop, i) {
                var champion = i + 1; // little offset cuz asyncloop is craycray
                getChampion(champion, function(err, champstats) {
                    console.log('got champion ' + champion + ':');
                    console.dir(champstats);

                    // stuff each champion object into the champs object
                    // containing all champions
                    champs[champion] = champstats;
                    console.dir(champs);

                    loop(); // loop through all champions until done
                });
            },

            callback: function() {
                done(null, champs);
            }
        });


//         for (var champion=1; champion<=total; champion++) {
//             console.log('lets kick off a getChampion with champ iterator: ' + champion); //a
//             getChampion(champion, function(err, champstats) { //b, d

//                 console.log('got champion ' + champion + ':');
//                 console.dir(champstats);

//                 // stuff each champion object into the champs object
//                 // containing all champions
// //                console.log('getting champion ' + champion);

//                 // get here before callback
//                 // don't callback until got
//                 champs[champion] = champstats;
//                 console.dir(champs);
//             });
            
//             if (champion == total) {
//                 console.log('champs.length: ' + champs.length + ' | total: ' + total + ' | champion: ' + champion); //c
//                 if (champs == total) {
                    
//                     console.log('here are ALL DA CHAMPS: >>');
//                     console.dir(champs);
                
//                     callback(null, champs);
//                 }
//             }
//         }
    });
}

        
               
    
    


/**
 * getChampion
 * 
 * Gets all champion key/value pairs from the redis db
 *
 * So that's like user's LARP champion name, race, stats, gold in their bank,
 * items in their inventory, etc.
 *
 * @param int requesteduser    user id number (UID)
 * @callback callback          called back with (err, champstats)
 */
var getChampion = function(requestedchampion, callback) {

    var champstats = {};
    console.log('user::getChampion requested champion: ' + requestedchampion);
    
    client.KEYS('champion/' + requestedchampion + '/*', function(err, replies) {
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
                    champstats[key] = value;

                    //                console.log('here:');
                    console.dir(champstats);

                    // calls back with champstats looking like:
                    //
                    // { 
                    //   name: 'NiPtune the Copycat',
                    //   pic: 'oiJFJfjewaoifjoiJOIDJFijeoifjd',
                    //   xp: '4',
                    //   race: 'CPU'
                    //   
                    // }
                    //
                    
                    if (i == replies.length-1) {
                        callback(null, champstats);
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
    getChampion: getChampion,
    getAllChampions: getAllChampions,
    getUserType: getUserType,
    isAdmin: isAdmin
}