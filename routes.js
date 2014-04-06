// routes that the user can visit which display info to the user

var passport = require('passport');
var db = require('./middleware/user.js');





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

    app.get('/user/type', function(req, res) {
        db.getUserType(req.user, function(err, type) {
            
        });
    });

    /**
     * Root of the web app
     */
    app.get('/', passport.authenticate('twitter'));


    /**
     * Admin control panel
     */
    app.get('/admin', function(req, res) {
        // if session exists
        if (req.user) {
            console.log('session exists');
                
            db.isAdmin(req.user, function(err, admin) {
                if (err) throw err;
                if (admin) {
                    // user is in admin group
                    console.log('user is in admin group');

                    db.getAllChampions(function(err, champions) {
                        console.log('got all champs: ');
                        console.dir(champions);
                        console.log('champ1 sword: ' + champions[1].sword);
                        res.render('admin.html', {champions: champions});
                    });

                } else {
                    res.send('you are nut an admin.');
                }
            });
        } else {
            console.log('session does not exist');
        }
    });


    /**
     * User stats & inventory page
     */
    app.get('/user/:uid', function(req, res) {


        var requser = req.params.uid
        var userinfo = {};

        // @todo we want to be able to use a username instead of a UID
        // get username from URL (^requser)
        // from username get UID (db.getUid)
        // use UID to get user object (db.getChampion)

        // work with redis to get user object
        db.getChampion(requser, function (err, champion) {
            if (err) {
                console.log('error interacting with redis');
                res.send('no such user');
                
            } else {
                console.log('no errs interacting with redis');
                console.dir(champion);
                res.render('inventory.html',
                           { champion: champion,
                             title: title,
                             subtitle: subtitle
                           });
            }
        });
    });       
}

module.exports = routes;








