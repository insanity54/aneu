// routes that the user can visit which display info to the user

var passport = require('passport');


var routes = function(app) {
    app.get('/', passport.authenticate('twitter'), function(req, res) {
        res.send('root');
    });
};

module.exports = routes;