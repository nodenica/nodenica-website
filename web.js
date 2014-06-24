var express         = require('express');
var cookieParser    = require('cookie-parser');
var session         = require('express-session');
var bodyParser      = require('body-parser')
var MongoStore      = require('connect-mongo')(session);
var app             = express();
var server          = require('http').createServer(app);
var io              = require('socket.io').listen(server);
var lingua          = require('lingua');
var raven           = require('raven');
var models          = require('./models');
var routes          = require('./routes');
var config          = require('./config');
var helpers         = require('./helpers');

// Session store
var store = new MongoStore({
    host: config.mongodb.host,
    port: config.mongodb.port,
    db: config.mongodb.db,
    username: config.mongodb.username,
    password: config.mongodb.password
});

helpers.socket.setStore( store );

// Process handler
helpers.process.init();

var socketio = new helpers.socket.use( io );

// send data to newrelic
if( helpers.site.isProduction() ){
    require('newrelic');
}

// Socket settings
io.set('log level', 1);
io.set('authorization', helpers.socket.authorization);
io.set("transports", ["xhr-polling"]);
io.set("polling duration", 10);

server.listen( config.port );

// set view directory
app.set('views', __dirname + '/views');

// set view engine
app.set('view engine', 'jade');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(cookieParser());
app.use(session({
    secret: config.express.secret,
    store: store,
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

app.use(raven.middleware.express( config.log.url ));

// PID
helpers.pid.make();

// Routes
routes.setup( app );