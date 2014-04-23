var db = require('./user');
var fs = require('fs');

var handleKeeperImage = function(req, res, next) {
    var upload = req.files.keeperImage;
//    var keeper = upload.pk
    var keeper = 5;
    var newPath = __dirname + '../static/uploads/' + upload.name;
    
    console.log('newpath: ' + newPath);
    fs.readFile(upload.path, function(err, data) {
        console.log('got upload:');
        console.dir(req.files);
        
        fs.writeFile(newPath, data, function(err) {
            if (err) return next(new Error(err));
            console.log('file uploaded.');

            db.addKeeperImage(keeper, newPath, function(err) {
                if (err) return('could not upload image');
                next();
            });
        });
    });
}



module.exports = {
    handleKeeperImage: handleKeeperImage
}