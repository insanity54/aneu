var db = require('./user');
var fs = require('fs');


var handleKeeperImage = function(req, res, next) {
    var upload = req.files.keeperImage;
    var newPath = __dirname + '/static/uploads/' + upload.name;
    
    console.log('newpath: ' + newPath);
    fs.readFile(upload.path, function(err, data) {
        console.log('got upload:');
        console.dir(req.files);
        
        fs.writeFile(newPath, data, function(err) {
            if (err) return next(new Error(err));
            console.log('file uploaded.');
            db.

            next();
        });
    });
}



module.exports = {
    handleKeeperImage: handleKeeperImage
}