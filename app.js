// includes express framework, loads configuration, and starts the server.
// @todo we might need to implement cross-origin resource sharing middleware... not sure yet


var express = require('express');
var http = require('http');
var app = express();
var server = http.createServer(app);
var nconf = require('nconf');
var passport = require('passport');
var nunjucks = require('nunjucks');
//var passport-twitter = require('passport-twitter');
//var middleware = require('./middleware');
//var passport = require('./component/passport');
//var component = require('./component');  // things like user module (db calls)

// load configuration
nconf.env(['port'])
     .file({ file: 'config.json' });

// set some app-wide variables
app.set('port', nconf.get('PORT'));
port = app.get('port');

app.set('title', nconf.get('TITLE'));
app.set('subtitle', nconf.get('SUBTITLE'));
app.set('domain', nconf.get('DOMAIN'));
app.set('session_secret', nconf.get('SESSION_SECRET'));
app.set('twitter_consumer_key', nconf.get('TWITTER_CONSUMER_KEY'));
app.set('twitter_secret_key', nconf.get('TWITTER_SECRET_KEY'));
app.set('twitter_login_callback', nconf.get('TWITTER_LOGIN_CALLBACK'));
app.set('facebook_app_id', nconf.get('FACEBOOK_APP_ID'));
app.set('facebook_app_secret', nconf.get('FACEBOOK_APP_SECRET'));
app.set('facebook_login_callback', nconf.get('FACEBOOK_LOGIN_CALLBACK'));
app.set('redisserver', nconf.get('REDISSERVER'));
app.set('upload_dir', nconf.get('UPLOAD_DIR'));
app.set('img_dir', nconf.get('IMG_DIR'));

// nunjucks templating
nunjucksEnv = new nunjucks.Environment( new nunjucks.FileSystemLoader(__dirname + '/tpl'), { autoescape: true });
nunjucksEnv.express(app);

// some expressy stuffy stuff
app.use(express.cookieParser());
//app.use(express.bodyParser()); 
app.use(express.session({ secret: app.get('session_secret') }));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.logger('dev')); // @todo for production,  change this
app.use(express.static(__dirname + '/static'));

// passport setup
require('./middleware/auth')
// passport.serializeUser(function(usr, done) {
//     console.log('ima serializeing');
//     done(null, usr.id);
// });

// passport.deserializeUser(function(id, done) {
//     console.log('ima deserializin and the user id is ' + id );
//     done(null, id);
// });


// routes
require('./routes')(app);
app.get('/test', function(req, res) {
    res.render('inventory.html');
});

// api endpoints
require('./api/auth')(app);
require('./api/keeper')(app);
require('./api/user')(app);
require('./api/upload')(app);
require('./api/qr')(app);

server.listen(port);
console.log('server listening on port ' + port);
