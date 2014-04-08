var redis = require('redis');
var user = require('../middleware/user');
var db = redis.createClient();

var keeper = function(app) {
    // select the redis server number set in the app config file
    db.select(app.get('redisserver'));
    console.log('changing redis server to: ' + app.get('redisserver'));

    
    /**
     * admin is posting the starting money amount for new keepers
     */
    app.post('/api/keeper/default/money', function(req, res) {

        console.log('req-------- ' + req.body.value);
        console.dir(req.body);
        
        // authenticate. Is requesting user admin?
        if (req.isAuthenticated) {
            // session exists. check if admin
            user.isAdmin(req.user, function(err, admin) {
                if (err) throw err;
                if (admin) {
                    // user is admin
                    console.log('requester is admin');
                    
                    // post the value from the db
                    db.SET('keeper/default/money', req.body.value, function(reply, reply2) {
                        console.log('redis reply: ' + reply + ' and2: ' + reply2);
                        res.send(200);
                    });
                }
            });
        }
    });


    /**
     * admin is posting the starting xp amount for new keepers
     */
    app.post('/api/keeper/default/stats/xp', function(req, res) {
        
        
    });



}
                                
module.exports = keeper;

                 //   post the value to the db
                 // return OK

                 
                                                    




