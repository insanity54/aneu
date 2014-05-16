var qr = require('../middleware/qr');
var pw = require('png-word')
var fs = require('fs');


var qrcode = function(app) {

    var domain = app.get('domain');
            
    
    app.get('/api/keeper/:kid/qr',
            getKeeperImage,
            function(req, res) {

                console.log('qr::middlewareEnder');

                console.log('successfully retrieved keeper image');

                res.writeHead(200, {"Content-Type": "image/png" });
                req.image.pipe(res);
//                res.end();
//                res.end(req.image, 'binary');
           });
    
    
    
    function getKeeperImage(req, res, next) {
        var imgDir = app.get('img_dir');
        var kid = req.params.kid;

        console.log('qr::getKeeperImage kid:' + kid);

        fs.readFile(imgDir + '/keeper-' + kid + '-qr.png', function(err, data) {
            console.log('qr::getKeeperImage::readFile');
            
            if (err) {
                
                console.log('there was an error: ' + err);
                if (err.code == 'ENOENT') {
                    // Error no entry... no such image, so we generate one
                    console.log('error no such image. creating one.');

                    qr.create(domain + '/keeper/' + kid, imgDir, function(err, qrStream) {
                        console.log('image CREATED');
                        if (err) throw err;
                        console.log('Created QR code. path: ' + qrStream);
                        console.dir(qrStream);

                        req.image = qrStream;
                        next();                    
                    });
                    
                } else {
                    // there was an error other than no file or directory
                    fs.readFile(imgDir + 'error.jpg',
                                              function(err, data) {
                        req.image = problem;
                        next();
                    });
                }
            } else {

                // No errors
                console.log('no errors. data: ' + data);
                req.image = data;
                next();
            }
        });
    }
}


               //return res.redirect('/img/keeper-' + kid + '-qr.png');        

                // var pngErr = new pw();

                // pngErr.on("parsed", function() {
                //     this.createReadStream("thre was an error").pipe(res);
                // });
                
                // //fs.createReadStream("there was an error");                
                // console.log(err);


module.exports = qrcode;