var db = require('./user');


var check = function(req, res, next) {
        if (req.isAuthenticated) {
            // session exists. check if admin
            db.isAdmin(req.user, function(err, admin) {
                if (err) throw err;
                if (admin) {
                    // user is admin
                    next();

                } else {
                    res.send('you are not an admin', 403);
                }
            });
        } else {
            console.log('session does not exist.');
            next('session does not exist');
        }
    };

module.exports = {
    check: check
};