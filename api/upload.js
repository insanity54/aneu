var db = require('../middleware/user');
var fs = require('fs');
var multiparty = require('multiparty');
var util = require('util');

var upload = function(app) {

    app.post('/api/keeper/upload',
             handleKeeperImage,
             function(req, res) {

                 console.log('this is only called upon SUCCEESSS');
          //       res.send(200);
             });

    
    function handleKeeperImage(req, res, next) {
        var form = new multiparty.Form();
        var uploadDir = app.get('upload_dir');
        var upload = req.files.keeperImage;
        


        
        form.parse(req, function(err, fields, files) {

            // get submitted kid
            // validate submitted kid
            //   - is user logged in?
            //   - does submitted kid belong to logged in user?
            //     - valid

            var kid = fields.kid;
            var requester = req.user;
            
            if (req.isAuthenticated()) {
                // user is logged in

                db.getKeeperOwner(kid, function(err, owner) {
                    if (owner = requester) {
                        
                        if (uploadDir.substr(-1) == '/') uploadDir = uploadDir.substr(0, uploadDir.length - 1); // remove trailing slash from uploadDir if there is one
                        console.log('upload name: ' + upload.name);
                        var newPath = uploadDir + '/' + upload.name;
                        
                        
                        console.log('newpath: ' + newPath);
                        fs.readFile(newPath, function(err, data) {
                            console.log('got upload:');
                            console.dir(req);
                            console.log('here is some PARAMACHUU!: *' +
                                        req.pikachu +
                                        ' *' +
                                        req.pikachu
                                       );
                            
                            fs.writeFile(newPath, data, function(err) {
                                if (err) return next(new Error(err));
                                console.log('file uploaded.');
                                
                                db.setKeeperImage(keeper, newPath, function(err) {
                                    if (err) throw err;
                                    console.log('set keeper image successfullyy');
                                    next();
                                });
                            });
                        });
                        
                        next();
                    } else {

                        return
                    }
                });
            }
        });
    }
}


module.exports = upload;