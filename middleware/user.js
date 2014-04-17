
var redis = require('redis');
var client = redis.createClient();
client.select(8, function(inf) { console.log(inf) }); //@todo this needs to come from config





//
// REDIS reference (use singular 'user' not plural 'users' plz)
//
////////////////////////////////////////
////////////////////////////////////////
//
// Foreword
//
// how to work with redis
//
//   - come up with the data you need to store
//     - example: keeper
//   - what data does keeper need to store in the db?
//     - Name, race, experience points, hitpoints, inventory, etcetera.
//     - come up with list (see below example, "chapions have:"
//   - use a key as an index for all keepers
//     ex: INCR keeper/index
//   - does the keeper need to be in some sort of group?
//     - make groups redis sets or ordered sets that contain
//       an index to the keeper in that group
//       ex: SADD keepergroup 1
//
//   
///////////////////////////////////////////////////////////
// Keepers and users
//
//
// keepers have:
//   - name
//   - biography
//   - image
//   - stats
//     - xp
//     - hp
//     - class
//     - race
//   - equipped items
//     - items equipped modify stats
//   - inventory
//     - contains items
//     - contains money
//
//  (key)  keeper/KID/name
//  (key)  keeper/KID/bio
//  (key)  keeper/KID/image      (a path to keeper's pic)
//  (key)  keeper/KID/stats/xp
//  (key)  keeper/KID/stats/hp
//  (key)  keeper/KID/stats/class
//  (key)  keeper/KID/stats/race
//  (zset) keeper/KID/equips     (ordered set of equipped iids) 
//  (zset) keeper/KID/items      (ordered set of iids in inventory)
//  (key)  keeper/KID/money
//  
//
// Users (n = UID) (user ID)
//
// (key) user/n/acct      // account type (twitter, facebook, or google)
// (set) user/n/keepers   // set of keeper ID numbers that the user owns
//
//
// Create a user
//   Increment user ID (UID)
//     INCR user/index
//
//   Add UID to set containing all UIDs
//     SADD user/alls 1         // add user ID to set of all user IDs
//
//   Set the user account type
//     SET user/1/acct [twitter|facebook|google]
//
//   Create the user's first keeper
//
//     Get keeper ID (KID) by incrementing keeper index
//       INCR keeper/index => KID
//
//     Set initial keeper data
//       SET keeper/KID/stats/xp [value of keeper/default/stats/xp]
//       SET keeper/KID/stats/hp [value of keeper/default/stats/xp]
//       SET keeper/KID/money [value of keeper/default/money]
//
//     Add keeper to active group
//       SADD keeper/active KID
//
//
// Get a Keeper's basic info
//   GET keeper/KID/name
//   GET keeper/KID/race
//   GET keeper/KID/class
//   GET keeper/KID/stats/xp
//   GET keeper/KID/stats/hp
//   GET keeper/KID/money
//  
//   
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
//   SMEMBERS user/alls 
//
//
// Add user 1 to admin group
//   SADD admin/all 1
//
// Add user 1 to twitter account
//   user
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
/////////////////////////////////////////////////////////////
// Admins. UIDs in this set are allowed admin access
// 
// (set) admin/all
//
//
// Show all admin IDs
//   SMEMBERS admin/all
//
//
/////////////////////////////////////////////////////////////
// Bank
// 
// Holds money for keepers
//
// (key) bank/KID/money
//
//
/////////////////////////////////////////////////////////////
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
//   - stats that augment the player's own stats (@todo future)
//     - attack
//     - defense
//     - durability
//
// item/index             an index of all item ID numbers (iid)
// item/all               a set containing all IIDs.
// item/weapon            a set of item numbers belonging to the weapon group
// item/consumable        a set of iids belonging to the consumable group
//
// item/iid/name             (key) name of item
// item/iid/description      (key) description of item
// item/iid/picture          base64 encoded png/jpg/etc.
// item/iid/stat/attack      attack statistic      (@todo future)
// item/iid/stat/defense     defense statistic     (@todo future)
// item/iid/stat/durability  durability statistic  (@todo future)
// 
// Retrieving list of all items
//   SMEMBERS item/all => [replies]
//   MGET [replies]
//
// Create an item
//   incr item/index    // use the returned value for the new item number
//   zadd item/weapon
// 
// 
////////////////////////////////////////
////////////////////////////////////////
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
        if (o.length == null) throw 'asyncLoop cannot have a null length';
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
    client.SISMEMBER('user/admins', uid, function(err, member) {
        console.log('checking to see if user ' + uid + ' is an admin');
        console.dir(uid);
        if (err) callback(true, null);
        callback(null, member);
    });
}


/**
 * getUser
 *
 * Gets a user from the database
 * user is returned as an object
 *
 * @param {int} uid    the user ID number to pull from the db
 */
var getUser = function(uid, callback) {
    userstats = {};
    
    client.MGET('user/' + uid + '/name',
                'user/' + uid + '/acct',

                function(err, replies) {
                    if (err) throw err;
                    // populate js object with replies
                    userstats['uid'] = uid;
                    userstats['name'] = replies[0];
                    userstats['acct'] = replies[1];

                    isAdmin(uid, function(err, admin) {
                        if (admin) {
                            userstats['admin'] = 1;
                        } else {
                            userstats['admin'] = 0;
                        }
                        callback(null, userstats);
                    });
                });
}
                   

/**
 * getAllUsers
 *
 * Gets all the users from the db
 *
 * @callback done     (err, users)
 */
var getAllUsers = function(done) {

    var users = {};
    
    // get total number of keepers in the LARP
    client.GET('user/index', function(err, total) {
        if (err) throw err;
        if (total == null) { console.log("ERROR: There are no users"); }
        console.log('total is: ' + total);

        
        asyncLoop({
            length: total,
            
            functionToLoop: function(loop, i) {
                var user = i + 1; // little offset to start at 1 instead of 0
                getUser(user, function(err, userstats) {
                    console.log('got user ' + user + ':');
                    console.dir(userstats);

                    // stuff each keeper object into the champs object
                    // containing all keepers
                    users[user] = userstats;
                    console.dir(users);

                    loop(); // loop through all users until done
                });
            },

            callback: function() {
                done(null, users);
            }
        });
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
    //     INCR user/index
    //
    //   Add UID to set containing all UIDs
    //     SADD user/alls 1         // add user ID to set of all user IDs
    //
    //   Set user data
    //     SET user/1/first_name Pete
    //     SET user/1/last_name Rogers
    //     SET user/1/username petey54


    createUser(function(err, uid) {
        if (err) throw err;

        // assiciate UID with TUID
        client.SET('user/twitter/' + tuid + '/uid', uid);

        callback(null, uid);
    });
}

/**
 * createFacebook
 *
 * Creates a LARP user account with a facebook log-in.
 * This func is called by findOrCreateFacebook()
 *
 * @param int fuid      The facebook user id number
 * @callback callback   called when user is created ({bool} err, {int} uid)
 */
var createFacebook = function(fuid, callback) {
    // Get UID using facebook ID
    //   user/facebook/100008203113508/uid => 1

    // generate a new UID
    // associate UID with FUID
    // return UID

    // Create a user
    //   Increment user ID (UID)
    //     INCR user/index
    //
    //   Add UID to set containing all UIDs
    //     SADD user/alls 1         // add user ID to set of all user IDs
    //
    //   Set user data
    //     SET user/1/first_name Pete
    //     SET user/1/last_name Rogers
    //     SET user/1/username petey54

    console.log('user.js::createFacebook');
    
    createUser(function(err, uid) {

        console.log('user.js::createFacebook::createUser');
        if (err) throw err;

        // assiciate UID with FUID
        client.SET('user/facebook/' + fuid + '/uid', uid);

        callback(null, uid);
    });
}


var createKeeper = function(uid, callback) {
    console.log('db:createKeeper - uid:' + uid);
    
    client.INCR('keeper/index', function(err, kid) {
        // set the keeper's owner (user)
        client.SET('keeper/' + kid + '/owner', uid);

        // add the keeper to the owner's keeper group
        client.SADD('user/' + uid + '/keepers', kid);

        // set some default values
        client.MGET('keeper/default/money',
                    'keeper/default/stats/xp',
                    'keeper/default/stats/hp',
                    function(err, results) {

                        if (err) throw err;

                        client.set('keeper/' + kid + '/money', results[0]);
                        client.set('keeper/' + kid + '/stats/xp', results[1]);
                        client.set('keeper/' + kid + '/stats/hp', results[2]);

                        // add keeper to user's keeper list
                        client.sadd('user/' + uid + '/keepers', kid);

                        callback(null, kid);
                    });
    });
}

/**
 * setKeeperImage
 *
 * stores the path to a keeper image in the db
 *
 * @param {int} kid            the keeper ID number
 * @param {String} image       a path to the keepers image
 * @callback callback          (err)
 */
var setKeeperImage = function(callback) {
    client.SET('keeper/' + kid + '/image', image, function(err) {
        if (err) callback(err);
        callback(null);
    });
}


 
/**
 * getKeeperDefaults
 *
 * Gets keeper defaults from the databse.
 * Runs every time a new keeper is created
 *
 * @callback callback      (err, replies)
 */
var getKeeperDefaults = function(callback) {
    client.MGET('keeper/default/money',
                'keeper/default/stats/xp',
                'keeper/default/stats/hp',

                function(err, replies) {
                    callback(null, replies);
                });
}
            
/**
 * setKeeperDefaults
 *
 * Sets keeper defaults in the databse.
 * This is only run once when the first user is created.
 *
 * @callback callback
 */
var setKeeperDefaults = function(callback) {
    client.set('keeper/default/money', 1500);
    client.set('keeper/default/stats/xp', 0);
    client.set('keeper/default/stats/hp', 1);

    callback(null);
};


/**
 * addAdmin
 *
 * Makes a user an admin by adding that user to the admin group
 *
 * @param uid           the user ID to add to the admin group
 * @callback callback   (err)
 */
var addAdmin = function(uid, callback) {
    console.log('db:addAdmin - creating admin' + uid);
    
    client.SADD('user/admins', uid, function(err, reply) {
        if (err) throw err;
        console.log('addAdmin reply: ' + reply);
        callback(null);
    });
}

/**
 * removeAdmin
 *
 * Removes a user from the admin group
 *
 * @param uid           the user ID to remove from the admin group
 * @callback callback   callback(err)
 */
var removeAdmin = function(uid, callback) {
    client.SREM('user/admins', uid, function(err, reply) {
        if (err) throw err;
        callback(null);
    });
}

/**
 * createUser
 *
 * Creates a new user. If it's the first user created,
 * that user is made an admin and keeper defaults are set in the db
 *
 * @callback callback    (err, uid)
 */
var createUser = function(callback) {
    console.log('user.js::createUser');
    
    createUID(function(err, uid) {
        console.log('user.js::createUser::createUID');


        if (uid == 1) {
            addAdmin(uid, function(err) {
                if (err) throw err;
                setKeeperDefaults(function(err) {
                    if (err) throw err;
                    callback(null, uid);
                });
            });
        } else {
            createKeeper(uid, function(err, kid) {
                if (err) callback(err, null);
                console.log('createUser::createUID::createKeeper');
                callback(null, uid);
            });
        }
        
    });
}
    
    
    
/**
 * createUID
 *
 * Creates a new user ID number in the redis db
 *
 * @callback callback    (err, uid)
 */
var createUID = function(callback) {
    client.INCR('user/index', function(err, uid) {
        if (err) throw err;

        // add uid to set containing all UIDs
        client.SADD('user/alls', uid, function(err, reply) {
            if (err) throw err;
            callback(null, uid);
        });
    });
}


/**
 * createKID
 *
 * Creates a new keeper ID number in the redis db
 *
 * @callback callback   (err, kid)
 */
var createKID = function(callback) {
    client.INCR('keeper/index', function(err, kid) {
        client.SADD('keeper/all', kid, function(err, reply) {
            if (err) throw err;
            callback(null, kid);
        });
    });
}

/**
 * createIID
 *
 * Creates a new item ID number in the redis db
 *
 * @callback callback   (err, iid)
 */
var createIID = function(callback) {
    client.INCR('item/index', function(err, iid) {
        client.SADD('item/all', iid, function(err, reply) {
            if (err) throw err;
            console.log('createIID reply: ' + reply);
            callback(null, iid);
        });
    });
}




var testCall = function(callback) {
    client.INCR('user/index', function(err, uid) {
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
 * findOrCreateFacebook
 * 
 * Finds the username in the redis db based on the facebook user id number
 * that the user is logging in with
 *
 * @param int fuid      The facebook user id number
 * @callback callback   called when facebook user found. (err, uid)
 */
var findOrCreateFacebook = function(fuid, callback) {

    console.log('db::findOrCreateFacebook  - looking for ' + fuid);

    client.GET('user/facebook/' + fuid + '/uid', function(err, uid) {
        if (err) callback(err, null);
        if (uid) {
            console.log('there is a facebooker so getting ' + uid);
            callback(null, uid);

        } else {
            console.log('there is not a facebooker so creating she');
            
            createFacebook(fuid, function(err, uid) {
                if (err) {console.log('there is an error'); callback(err, null);}
                console.log('create facebook gave me: ' + uid);
                callback(null, 1);
            });
        }
    });
}

/**
 * getAllKeepers
 *
 * Gets an object containing objects for every keeper in the LARP.
 *
 * @callback done          called back with (err, keepers)
 */
var getAllKeepers = function(done) {

    var keepers = {};
    
    // get total number of keepers in the LARP
    client.GET('keeper/index', function(err, total) {
        if (err) throw err;
        if (total == null) { console.log("ERROR: There are no keepers"); }
        console.log('total is: ' + total);

        
        asyncLoop({
            length: total,
            
            functionToLoop: function(loop, i) {
                var keeper = i + 1; // little offset cuz asyncloop is craycray
                getKeeper(keeper, function(err, keeperstats) {
                    console.log('got keeper ' + keeper + ':');
                    console.dir(keeperstats);

                    // stuff each keeper object into the champs object
                    // containing all keepers
                    keepers[keeper] = keeperstats;
                    console.dir(keepers);

                    loop(); // loop through all keepers until done
                });
            },

            callback: function() {
                done(null, keepers);
            }
        });
    });
}

        
               
    
    


/**
 * getKeeper
 * 
 * Gets basic keeper info from the redis db
 *
 * So that's like user's LARP keeper name, race, stats, gold in their bank,
 * items in their inventory, etc.
 *
 * @param int kid              keeper id number (KID)
 * @callback callback          called back with (err, keeperstats)
 */
var getKeeper = function(kid, callback) {

    var keeperstats = {};
    console.log('user::getKeeper requested keeper: ' + kid);
    
    client.MGET(
        'keeper/' + kid + '/name',
        'keeper/' + kid + '/race',
        'keeper/' + kid + '/class',
        'keeper/' + kid + '/stats/xp',
        'keeper/' + kid + '/stats/hp',
        'keeper/' + kid + '/money',

        function(err, replies) {
            if (err) throw err;
            // populate js object with replies
            keeperstats['name'] = replies[0];
            keeperstats['race'] = replies[1];
            keeperstats['class'] = replies[2];
            keeperstats['xp'] = replies[3];
            keeperstats['hp'] = replies[4];
            keeperstats['money'] = replies[5];

            callback(null, keeperstats);
        });
}


module.exports = {
    findOrCreateTwitter: findOrCreateTwitter,
    findOrCreateFacebook: findOrCreateFacebook,
    
    getKeeper: getKeeper,
    getKeeperDefaults: getKeeperDefaults,
    getAllKeepers: getAllKeepers,
    setKeeperImage: setKeeperImage,
    
    getUser: getUser,
    getAllUsers: getAllUsers,
    getUserType: getUserType,
    
    isAdmin: isAdmin,
    addAdmin: addAdmin,
    removeAdmin: removeAdmin
}