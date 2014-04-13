var redis = require('redis');
var db = require('../middleware/user.js');



var user = function(app) {
    // select the redis server number set in the app config file                
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
}

module.exports = user;