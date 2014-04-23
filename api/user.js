var db = require('../middleware/user.js');



var user = function(app) {
    
    /**
     * admin is making a user an admin
     * or removing admin status from a user
     */
    app.post('/api/user/admin', function(req, res) {
        console.log('PK: ' + req.body.pk);

        
        // authenticate. Is requesting user admin?
        if (req.isAuthenticated) {
            // session exists. check if admin
            db.isAdmin(req.user, function(err, admin) {
                if (err) throw err;
                if (admin) {
                    // user is admin 
                    console.log('requester is admin');

                    // post the value from the client
                    if (req.body.value == 1 || req.body.value == 'yes') {
                        // adding user to admin group
                        db.addAdmin(req.body.value, function(err) {
                            if (err) throw err;
                            console.log('adding admin');
                            res.send(200);
                        });                        

                    } else {
                        // removing user from admin group
                        db.removeAdmin(req.body.value, function(err) {
                            if (err) throw err;
                            console.log('removing admin');
                            res.send(200);
                        });
                    }
                }
            });
        }
    });


    /**
     * user or app is requesting user deets
     */
    app.get('/api/user/:uid', function(req, res) {

        uid = req.params.uid;
        userstats = {};
        
        // work with redis to get keeper object
        db.getUserKeepers(uid, function (err, keepers) {
            if (err) {
                console.log('error interacting with redis');
                res.send('no such user keepers');

                
            } else {
                console.log('uid: ' + uid);                
                console.log('keepers to be json\'d');
                console.dir(keepers);
                res.json(keepers);
            }
        });

        
    });
}

module.exports = user;
