var express = require('express');
var MongoStore = require('connect-mongo')(express);
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var lingua  = require('lingua');
var models = require('./models');
var routes = require('./routes');
var config = require('./config');
var helpers = require('./helpers');

var socketio = new helpers.socket.use( io );

// send data to newrelic
if( helpers.site.isProduction() ){
    require('newrelic');
}

// handle hashtag and store
helpers.tweets.enable(socketio);

// Socket settings
io.set('log level', 1);
io.set('authorization', helpers.socket.authorization);

server.listen( config.port );

// set view directory
app.set('views', __dirname + '/views');

// set view engine
app.set('view engine', 'jade');

// Set json parser
app.use(express.json());

// Set urlencoded
app.use(express.urlencoded());

// Set cookie parser
app.use(express.cookieParser());
app.use(express.session({
    secret: config.express.secret,
    store: new MongoStore({
        db: config.mongodb.db
    }),
    key: config.express.key
}));


// Set public directory
app.use(express.static(__dirname + '/public'));

// Set language
app.use(lingua(app, {
    defaultLocale: config.lang,
    path: __dirname + '/i18n'
}));

// Site middleware
app.use(helpers.site.express);

// socketio middleware
app.use(helpers.socket.express(socketio));

// Validate installation
app.use( helpers.install );

// PID
helpers.pid.make();

// Routes
routes.setup( app );