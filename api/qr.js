//var qr = require('../middleware/qr');
var pw = require('png-word')
var fs = require('fs');


var qrcode = function(app) {
    
    app.get('/api/keeper/:kid/qr',
            getKeeperImage,
            function(req, res) {

                console.log('qr::middlewareEnder');

                console.log('successfully retrieved keeper image');

                res.writeHead(200, {"Content-Type": "image/png" });
                res.end(req.image, 'binary');
           });
    
    
    
    function getKeeperImage(req, res, next) {
        var imgDir = app.get('img_dir');
        var kid = req.params.kid;

        console.log('qr::getKeeperImage');

        var img = fs.readFile(imgDir + '/keeper-' + kid + '-qr.png', function(err, data) {
            console.log('qr::getKeeperImage::readFile');
            
            if (err) {
                console.log('there was an error');
                // var pngErr = new pw();

                // pngErr.on("parsed", function() {
                //     this.createReadStream("thre was an error").pipe(res);
                // });
                
                // //fs.createReadStream("there was an error");                
                // console.log(err);
            }

            req.image = data;
            next();
        });
        

        
        //return res.redirect('/img/keeper-' + kid + '-qr.png');
    }
}
        

module.exports = qrcode;