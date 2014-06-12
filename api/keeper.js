var redis = require('redis');
var db = require('../middleware/user');
var admin = require('../middleware/admin');
var client = redis.createClient();

var keeper = function(app) {
    // select the redis server number set in the app config file
    client.select(app.get('redisserver'));
    console.log('changing redis server to: ' + app.get('redisserver'));


    function checkAdmin(req, res, next) {
        if (req.isAuthenticated) {
            // session exists. check if admin
            db.isAdmin(req.user, function(err, admin) {
                if (err) throw err;
                if (admin) {
                    // user is admin
                    next();
                } else {
                    res.send(' yer not an admin');
                }
            });
        }
    };
        
    function getAllKeepers(req, res, next) {
        db.getAllKeepers(function(err, keepers) {
            req.keepers = keepers;
            next();
        });
    };
    
    /**
     * admin is posting the starting money amount for new keepers
     */
    app.post('/api/keeper/default/money',
             checkAdmin,
             function(req, res) {

                 console.log('req-------- ' + req.body.value);
                 console.dir(req.body);
                 
                 console.log('GOOD NEWS. requester is admin');
                 
                 // post the value from the client
                 client.SET('keeper/default/money', req.body.value, function(reply, reply2) {
                     console.log('redis reply: ' + reply + ' and2: ' + reply2);
                     res.send(200);
                 });
             });



    /**
     * admin is posting the starting xp amount for new keepers
     */
    app.post('/api/keeper/default/stats/xp', function(req, res) {
        
        
    });



    /**
     * user is requesting keeper information
     */
    app.get('/api/keeper/:kid', function(req, res) {
        var kid = req.params.kid;
        
        db.getKeeper(kid, function(err, keeper) {
            res.json(keeper);
        });
    });

    app.get('/api/keeper',
            getAllKeepers,
            function(req, res) {
                res.json(req.keepers);
            });

    app.get('/api/keeper',
            getAllKeepers,
            function(req, res) {
                res.json(req.keepers);
            });
}



           
                                
module.exports = keeper;

                 // post the value to the client
                 // return OK

                 
                                                    




