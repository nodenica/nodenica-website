var email = require('./email');
var site = require('./site');

exports.init = function(){

    process.on('uncaughtException', function (error) {
        if (!site.admins) {
            return console.log(error.stack);
        };

        site.admins(function(admins){
            if( admins ){
                admins.forEach( function( admin ){
                    var settings = {
                        text: error.stack,
                        to: admin.name + '<' + admin.email + '>',
                        subject: 'uncaughtException'
                    }

                    email.send( settings );
                });
            }
        });
    });

}
