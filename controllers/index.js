'use strict';

var ArticleModel = require('../models/article');

module.exports = function(router) {

  var articleModel = new ArticleModel();

  router.get('/', function(req, res) {

    var model = {
      articles: articleModel.getAll(10)
    };

    res.render('index', model);

  });

  router.get('/create', function(req, res) {

    res.render('create', null);

  });
};
