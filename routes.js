// routes that the user can visit which display info to the user

var passport = require('passport');
var db = require('./middleware/user.js');





var routes = function(app) {

    var title = app.get('title');
    var subtitle = app.get('subtitle');



    /**
     * Root of the web app
     */
    app.get('/', passport.authenticate('twitter'));


    /**
     * Admin control panel
     */
    app.get('/admin', function(req, res) {
//        if (user.isAdmin(user.getUser
        // @todo
    });


    /**
     * User stats & inventory page
     */
    app.get('/user/:username', function(req, res) {


        var requser = req.params.username
        var userinfo = {};

        // get username from URL (^requser)
        // from username get UID (db.getUid)
        // use UID to get user object (db.getUser)

        // work with redis to get user object
        db.getUser(requser, function (err, user) {
            if (err) {
                console.log('error interacting with redis');
                res.send('no such user');
            } else {
                console.log('no errs interacting with redis');
                console.dir(user);
                res.render('inventory.html',
                           { user: user,
                             title: title,
                             subtitle: subtitle
                           });
            }
        });
    });       
}

module.exports = routes;








