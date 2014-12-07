'use strict';

var ArticleModel = require('../../models/article');

module.exports = function(router) {

  var articleModel = new ArticleModel();

  router.get('/', function(req, res) {

    var model = {
      articles: articleModel.getByType(3, 10)
    };

    res.render('training/index', model);

  });
};
