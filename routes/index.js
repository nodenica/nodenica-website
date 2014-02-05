var controllers = require('../controllers');

// validate user session
function auth(req,res,next){

    var path = ( req.path == null ) ? '/' : req.path;
    if(req.session.user){
        next();
    }else{
     res.redirect('/user/login?back='+path);
    }

}

exports.setup = function( _app ){

    _app.get( '/', controllers.home.index );

    _app.get( '/install', controllers.install.home );
    _app.post( '/install', controllers.install.home );

    _app.get( '/user/register', controllers.users.signUp );
    _app.post( '/user/register', controllers.users.signUp );
    _app.get( '/user/login', controllers.users.login );
    _app.post( '/user/login', controllers.users.login );
    _app.get( '/user/logout', controllers.users.logout );
    _app.get( '/user/forgot', controllers.users.forgot );
    _app.post( '/user/forgot', controllers.users.forgot );
    _app.get( '/user/reset/:forgot_token', controllers.users.reset );
    _app.post( '/user/reset/:forgot_token', controllers.users.reset );
    _app.get( '/user/activate', controllers.users.activateIndex );
    _app.get( '/user/activate/:id', controllers.users.activateAction );
    _app.get( '/user/:username', controllers.users.get );

    _app.get( '/questions', controllers.questions.home);
    _app.get( '/questions/create', auth, controllers.questions.create);
    _app.post( '/questions/create', auth, controllers.questions.create);
    _app.get( '/questions/:slug/edit', auth, controllers.questions.edit);
    _app.post( '/questions/:slug/edit', auth, controllers.questions.edit);
    _app.get( '/questions/:slug', controllers.questions.get);
    _app.post( '/questions/:slug', controllers.questions.get);

    _app.get( '/blog', controllers.blog.home);
    _app.get( '/blog/create', auth, controllers.blog.create);
    _app.post( '/blog/create', auth, controllers.blog.create);
    _app.get( '/blog/:slug/edit', auth, controllers.blog.edit);
    _app.post( '/blog/:slug/edit', auth, controllers.blog.edit);
    _app.get( '/blog/:slug', controllers.blog.get);
    _app.post( '/blog/:slug', controllers.blog.get);

    _app.get( '/training', controllers.training.home);
    _app.get( '/training/create', auth, controllers.training.create);
    _app.post( '/training/create', auth, controllers.training.create);
    _app.get( '/training/:slug/edit', auth, controllers.training.edit);
    _app.post( '/training/:slug/edit', auth, controllers.training.edit);
    _app.get( '/training/:slug', controllers.training.get);
    _app.post( '/training/:slug', controllers.training.get);

    _app.get( '/streaming', controllers.streaming.get);

    _app.get( '*', controllers.home.notFound);

    //_app.get( '/users/:user' )
}


