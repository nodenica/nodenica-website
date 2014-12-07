'use strict';

var UserModel = require('../../models/user');
var randomString = require('randomstring');

module.exports = function(router) {

  var userModel = new UserModel();

  router.get('/login', function(req, res) {

    res.render('user/login', null);

  });

  router.get('/logout', function(req, res) {
    var response = userModel.logout(req.session.auth.id);
    req.session.auth = null;
    res.redirect('/user/login');

  });

  router.post('/login', function(req, res) {
    if (req.body.email === '') {
      req.flash('error', 'Escriba su correo electrónico');
    }

    if (req.body.password === '') {
      req.flash('error', 'Escriba su contraseña');
    }

    if (res.locals.flash.length > 0) {
      var model = {
        error: res.locals.flash[0].message,
        form: req.body
      };

      // reset flash messages
      req.session.flash = [];

      res.render('user/login', model);
    }
    else {
      // authenticate
      var auth = userModel.login(req.body.email, req.body.password);

      if (auth.error) {
        var model = {
          error: 'Datos incorrectos.',
          form: req.body
        };
        res.render('user/login', model);
      }
      else {
        var user = userModel.getById(auth.userId, auth.id);
        if (user.error) {
          var model = {
            error: user.error.message,
            form: req.body
          };
          // remove accessToken from database
          userModel.logout(auth.id);
          res.render('user/login', model);
        }
        else if (user.emailVerified === false) {
          var model = {
            error: 'Su cuenta no se ha activado aún. Revise su correo electrónico.',
            form: req.body
          };
          // remove accessToken from database
          userModel.logout(auth.id);
          res.render('user/login', model);
        }
        else {
          req.session.auth = auth;
          req.session.currentUser = user;
          res.redirect('/');
        }
      }
    }
  });

  router.get('/register', function(req, res) {

    res.render('user/register', null);

  });

  router.post('/register', function(req, res) {

    if (req.body['first_name'] === '') {
      req.flash('error', 'Escriba su nombre');
    }

    if (req.body['last_name'] === '') {
      req.flash('error', 'Escriba sus apellidos');
    }

    if (req.body.username === '') {
      req.flash('error', 'Escriba su nombre de usuario');
    }

    if (req.body.email === '') {
      req.flash('error', 'Escriba su correo electrónico');
    }

    if (req.body.password === '') {
      req.flash('error', 'Escriba su contraseña');
    }

    if (res.locals.flash.length > 0) {
      var model = {
        error: res.locals.flash[0].message,
        form: req.body
      };

      // reset flash messages
      req.session.flash = [];

      res.render('user/register', model);
    }
    else {
      var verificationToken = randomString.generate(32);
      var user = userModel.create(
        req.body['first_name'],
        req.body['last_name'],
        req.body.username,
        req.body.email,
        req.body.password,
        verificationToken
      );

      if (user.error) {
        var model = {
          error: user.error.message,
          form: req.body
        };
        res.render('user/register', model);
      }
      else {
        var email = {
          name: req.body['first_name'] + ' ' + req.body['last_name'],
          email: req.body.email,
          subject: 'Activa tu cuenta de NodeNica',
          text: 'Bienvenido ' + req.body['first_name'] + ' ' + req.body['last_name'] + '\n\nAhora sólo tienes que visitar el enlace siguiente para activar tu cuenta:\n\nhttp://www.nodenica.com/user/activate/' + verificationToken + '/' + user.id + '\n\nSi no has creado una cuenta recientemente en www.nodenica.com por favor ignora este mensaje.\n\n© NodeNica'
        }
        req.sendMail(email.name, email.email, email.subject, email.text, function(response) {
          res.redirect('/user/activate');
        });
      }
    }
  });

  router.get('/activate', function(req, res) {

    res.render('user/activate', null);

  });

  router.get('/activate/:token/:id', function(req, res) {

    userModel.activate(req.params.id, req.params.token);
    res.redirect('/user/login');

  });
};
