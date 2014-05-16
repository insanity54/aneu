// routes that the user can visit which display info to the user

var passport = require('passport');
var db = require('./middleware/user');
//var upload = require('./middleware/upload');




var routes = function(app) {

    var title = app.get('title');
    var subtitle = app.get('subtitle');


    /**
     *  testing
     */
    app.get('/test', function(req, res) {
        db.findOrCreateTwitter('27835703', function(err, uid) {
            if (err) throw err;
            console.log('user ID is: ' + uid + '.');
            res.send('user ID is: ' + uid + '.');
        });
    });
        
    app.get('/test2', function(req, res) {
        db.testCall(function(err, uddie) {
            if (err) throw err;
            console.log('WE GOT AN UDDIE: ' + uddie);
            res.send('uddie: ' + uddie);
        });
    });

    app.get('/test3', function(req, res) {

        var mime = require('mime-magic');

        mime('/home/grimtech/scripts/aneu/static/keeper.png', function(err, type) {
            if (err) {
                console.error(err.message);
                res.send(err.message);

            } else {
                console.log('detected mime type: %s', type);
                res.send('detected mime type: ' + type);

            }
        });
    });
            
    
    app.get('/user/type', function(req, res) {
        db.getUserType(req.user, function(err, type) {
            
        });
    });

    /**
     * Root of the web app
     */
    app.get('/', function(req, res) {
        res.redirect('user/1');
    });


    /**
     * Admin control panel
     */
    app.get('/admin', function(req, res) {
        // if session exists
        if (req.isAuthenticated()) {
            console.log('session exists');
                
            db.isAdmin(req.user, function(err, admin) {
                if (err) throw err;
                if (admin) {
                    // user is in admin group
                    console.log('user is in admin group');

                    // get default configurations
                    db.getKeeperDefaults(function(err, configs) {
                        if (err) throw err;

                        db.getAllKeepers(function(err, keepers) {
                            console.log('got all keepers: ');
                            console.dir(keepers);
                            console.log('champ1 sword: ' + keepers[1].sword);

                            db.getAllUsers(function(err, users) {
                                res.render('admin.html',
                                           { keepers: keepers,
                                             users: users,
                                             configs: configs });
                            });
                        });
                    });

                } else {
                    res.send('you are nut an admin.');
                }
            });
        } else {
            console.log('session does not exist');
            res.send(401);
        }
    });


    /**
     * User stats & inventory page
     */
    app.get('/user/:uid', function(req, res) {


        var uid = req.params.uid
        var userinfo = {};

        // @todo we want to be able to use a username instead of a UID
        // get username from URL (^requser)
        // from username get UID (db.getUid)
        // use UID to get user object (db.getKeeper)

        // work with redis to get keeper object
        db.getUserKeepers(uid, function (err, keepers) {
            if (err) {
                console.log('error interacting with redis');
                res.send('no such user keepers');
                
            } else {
                // no errors
                
                var user = null;
                if (req.isAuthenticated()) {

                    // user is logged in

                    console.log('user ' + req.user +
                                'is viewing user page' + uid );

                    if ( req.user === uid ) {
                        // user is owner of this page
                        console.log('user owns this page');
                        
                        user = req.user;
                        
                        console.log('vv keepers to be rendered vv');
                        console.dir(keepers);
                        res.render('user.html',
                                   { keepers: keepers,
                                     title: title,
                                     subtitle: subtitle,
                                     user: user,
                                     editable: true
                                   });
                        
                    }
                    
                } else {
                    // user not logged in or
                    // user is not owner of this page

                    console.log('user not logged in or does not own this page');
                    
                    res.render('user.html',
                               { keepers: keepers,
                                 title: title,
                                 subtitle: subtitle,
                                 editable: false
                               });
                }
            }
        });
    });       
}

module.exports = routes;








