var models = require('../models');

/**
 * Installation middleware
 *
 * @param req
 * @param res
 * @param next
 */
module.exports = function(req, res, next){

    res.locals.user = req.session.user;

    if( req.url != '/install' ){

        models.users.count({}, function(err, c){
            if( err ){
                res.render('install/index.jade', {error: err});
            }
            else{
                if( c === 0 ){
                    res.redirect('/install');
                }
                else{
                    next();
                }
            }
        });

    }
    else{
        next();
    }

}