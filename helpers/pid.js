var fs = require('fs');
var path = require('path');

exports.make = function(){

    var directory = path.resolve( __dirname, '../pids');

    if( !fs.existsSync( directory ) ){

        fs.mkdirSync( directory );

    }

    var pidfile = fs.openSync(path.resolve( __dirname, '../pids/site.pid' ), "w");
    fs.writeSync(pidfile, process.pid);
    fs.closeSync(pidfile);
}